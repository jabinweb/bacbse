import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { PaymentStatus } from '@prisma/client';
import { getAcademicYearEndDate } from '@/lib/subscription-date-utils';

// Webhook endpoint for Razorpay payment notifications
export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('[RazorpayWebhook] Received webhook notification');

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('x-razorpay-signature');

    if (!signature) {
      console.error('[RazorpayWebhook] Missing signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    // Get webhook secret from admin settings, fallback to environment variable
    let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    try {
      const settings = await prisma.adminSettings.findMany({
        where: {
          key: {
            in: ['razorpayWebhookSecret']
          }
        }
      });
      
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      if (settingsMap.razorpayWebhookSecret) {
        webhookSecret = settingsMap.razorpayWebhookSecret;
      }
    } catch {
      console.warn('[RazorpayWebhook] Could not fetch webhook secret from settings, using environment variable');
    }
    
    if (!webhookSecret) {
      console.error('[RazorpayWebhook] Webhook secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('[RazorpayWebhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('[RazorpayWebhook] Event type:', event.event);

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const paymentData = event.payload.payment.entity;
      const orderId = paymentData.order_id;
      const paymentId = paymentData.id;
      const amount = paymentData.amount;
      const status = paymentData.status;

      console.log('[RazorpayWebhook] Processing payment.captured:', { orderId, paymentId, amount, status });

      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
      });

      if (!payment) {
        console.error('[RazorpayWebhook] Payment record not found for order:', orderId);
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
      }

      // Update payment status if not already completed
      if (payment.status !== PaymentStatus.COMPLETED) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: paymentId,
            status: PaymentStatus.COMPLETED,
            updatedAt: new Date()
          }
        });

        console.log('[RazorpayWebhook] Payment updated to COMPLETED:', payment.id);

        // Process subscription creation if metadata exists
        if (payment.metadata) {
          try {
            const metadata = typeof payment.metadata === 'string' 
              ? JSON.parse(payment.metadata) 
              : payment.metadata;

            // Create subscription using the same logic as the verify endpoint
            await processSubscriptionCreation(metadata, payment);
            console.log('[RazorpayWebhook] Subscription processed successfully');
          } catch (subscriptionError) {
            console.error('[RazorpayWebhook] Failed to process subscription:', subscriptionError);
            // Don't fail webhook - payment is already processed
          }
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`[RazorpayWebhook] Webhook processed successfully in ${processingTime}ms`);
      return NextResponse.json({ status: 'success' });
    }

    // Handle payment.failed event
    if (event.event === 'payment.failed') {
      const paymentData = event.payload.payment.entity;
      const orderId = paymentData.order_id;
      const paymentId = paymentData.id;

      console.log('[RazorpayWebhook] Processing payment.failed:', { orderId, paymentId });

      // Update payment record if exists
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
      });

      if (payment && payment.status !== PaymentStatus.FAILED) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: paymentId,
            status: PaymentStatus.FAILED,
            updatedAt: new Date()
          }
        });

        console.log('[RazorpayWebhook] Payment marked as FAILED:', payment.id);
      }

      return NextResponse.json({ status: 'success' });
    }

    console.log('[RazorpayWebhook] Unhandled event type:', event.event);
    return NextResponse.json({ status: 'ignored' });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[RazorpayWebhook] Webhook processing failed after ${processingTime}ms:`, error);
    
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 });
  }
}

// Helper function to process subscription creation
async function processSubscriptionCreation(metadata: Record<string, unknown>, payment: Record<string, unknown>) {
  if (metadata.type === 'class_subscription') {
    // Check for existing subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: metadata.userId as string as string,
        classId: metadata.classId as number,
        subjectId: null,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      }
    });

    if (!existingSubscription) {
      const endDate = getAcademicYearEndDate(); // Academic year ends March 31st
      await prisma.subscription.create({
        data: {
          userId: metadata.userId as string,
          classId: metadata.classId as number,
          subjectId: null,
          status: 'ACTIVE',
          planType: 'class_subscription',
          amount: payment.amount as number,
          currency: (payment.currency as string) || 'INR',
          startDate: new Date(),
          endDate: endDate
        }
      });
    }
  } else if (metadata.type === 'subject_subscription') {
    const subjectIds: string[] = (metadata.subjectIds as string[]) || (metadata.subjectId ? [metadata.subjectId as string] : []);
    
    if (subjectIds.length > 0) {
      // Check for existing subscriptions
      const existingSubscriptions = await prisma.subscription.findMany({
        where: {
          userId: metadata.userId as string,
          subjectId: { in: subjectIds },
          status: 'ACTIVE',
          endDate: { gte: new Date() }
        }
      });

      const existingSubjectIds = existingSubscriptions.map(s => s.subjectId).filter((id): id is string => id !== null);
      const newSubjectIds = subjectIds.filter((id: string) => !existingSubjectIds.includes(id));

      if (newSubjectIds.length > 0) {
        const endDate = getAcademicYearEndDate(); // Academic year ends March 31st
        const subscriptionData = newSubjectIds.map((subjectId: string) => ({
          userId: metadata.userId as string,
          subjectId: subjectId,
          status: 'ACTIVE' as const,
          planType: 'subject_subscription' as const,
          amount: Math.floor(((payment.amount as number) || 0) / subjectIds.length),
          currency: (payment.currency as string) || 'INR',
          startDate: new Date(),
          endDate: endDate
        }));

        await prisma.subscription.createMany({
          data: subscriptionData
        });
      }
    }
  }
}