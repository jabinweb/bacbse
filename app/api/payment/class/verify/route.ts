import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import { generateEmailContent } from '@/lib/email';
import { notifyAdminNewSubscription } from '@/lib/admin-notifications';
import { logPaymentCompleted, logPaymentFailed, logSubscriptionCreated } from '@/lib/activity-logger';
import { getAcademicYearEndDate } from '@/lib/subscription-date-utils';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, classId } = await req.json();

    // Fetch payment settings
    const settings = await prisma.adminSettings.findMany({
      where: {
        key: {
          in: ['paymentMode', 'razorpayTestKeySecret', 'razorpayKeySecret']
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    if (!settings.length) {
      console.error('Error fetching settings: No settings found');
      return NextResponse.json({ error: 'Payment configuration not found' }, { status: 500 });
    }

    const settingsObj = settings.reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const paymentMode = settingsObj.paymentMode || 'test';
    const keySecret = paymentMode === 'test' ? settingsObj.razorpayTestKeySecret : settingsObj.razorpayKeySecret;

    if (!keySecret) {
      return NextResponse.json({ 
        error: `Razorpay ${paymentMode} secret not configured` 
      }, { status: 500 });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Get class details
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        select: {
          id: true,
          name: true,
          price: true
        }
      });

      if (!classData) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }

      // Create class-specific subscription using Prisma
      const endDate = getAcademicYearEndDate(); // Academic year ends March 31st
      try {
        const subscription = await prisma.subscription.create({
          data: {
            userId,
            classId: parseInt(classId),
            status: 'ACTIVE',
            planType: 'class_access',
            planName: `${classData.name} Access`,
            amount: classData.price,
            currency: 'INR',
            startDate: new Date(),
            endDate: endDate
          }
        });

        // Log subscription creation activity
        await logSubscriptionCreated(
          userId,
          subscription.id,
          `${classData.name} Access`,
          classData.price || 0
        );

        // Send welcome email after successful subscription creation
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, displayName: true }
          });

          if (user?.email) {
            const welcomeEmailContent = generateEmailContent('new_subscription', {
              userName: user.displayName || user.email.split('@')[0],
              className: classData.name,
              subscriptionType: 'Class Access',
              endDate: endDate.toISOString(),
              amount: classData.price || 0
            });

            await sendEmail({
              to: user.email,
              subject: welcomeEmailContent.subject,
              html: welcomeEmailContent.html,
              text: welcomeEmailContent.text
            });

            // Send payment receipt email
            const receiptEmailContent = generateEmailContent('payment_receipt', {
              userName: user.displayName || user.email.split('@')[0],
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              subscriptionName: `${classData.name} - Class Access`,
              amount: classData.price || 0,
              paymentDate: new Date().toISOString()
            });

            await sendEmail({
              to: user.email,
              subject: receiptEmailContent.subject,
              html: receiptEmailContent.html,
              text: receiptEmailContent.text
            });

            // Send admin notification for new subscription
            await notifyAdminNewSubscription({
              userName: user.displayName || user.email.split('@')[0],
              userEmail: user.email,
              subscriptionName: `${classData.name} - Class Access`,
              amount: classData.price || 0
            });
          }
        } catch (emailError) {
          console.error('Error sending welcome/receipt emails:', emailError);
          // Don't fail the payment verification if email fails
        }
      } catch (subscriptionError) {
        console.error('Error creating class subscription:', subscriptionError);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
      }

      // Store payment record
      try {
        await prisma.payment.create({
          data: {
            userId,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amount: classData.price || 0,
            currency: 'INR',
            status: 'COMPLETED',
            description: `Class subscription: ${classData.name}`,
          }
        });

        // Log successful payment activity
        await logPaymentCompleted(userId, razorpay_payment_id, classData.price || 0, 'razorpay')
          .catch(err => console.error('Failed to log payment activity:', err));

      } catch (paymentError) {
        console.error('Error creating payment record:', paymentError);
        
        // Log failed payment activity
        await logPaymentFailed(userId, razorpay_payment_id, classData.price || 0, 'razorpay', 'Payment record creation failed')
          .catch(err => console.error('Failed to log payment failure:', err));
        
        // Don't fail the request as subscription is already created
      }

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Class payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
