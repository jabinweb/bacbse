import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentOrder, getPaymentConfig } from '@/lib/payment-service';

interface PaymentRequest {
  subjectId?: string; // For backward compatibility
  subjectIds?: string[]; // For multiple subjects
  userId: string;
  amount?: number;
}

export async function POST(request: Request) {
  try {
    const { subjectId, subjectIds, userId, amount }: PaymentRequest = await request.json();

    // Handle both single and multiple subject selection
    const selectedSubjectIds = subjectIds || (subjectId ? [subjectId] : []);

    if (selectedSubjectIds.length === 0 || !userId) {
      return NextResponse.json({ 
        error: 'Subject ID(s) and User ID are required' 
      }, { status: 400 });
    }

    // Get all subject details
    const subjects = await prisma.subject.findMany({
      where: { 
        id: { 
          in: selectedSubjectIds 
        } 
      },
      include: {
        class: true
      }
    });

    if (subjects.length === 0) {
      return NextResponse.json({ 
        error: 'No subjects found' 
      }, { status: 404 });
    }

    if (subjects.length !== selectedSubjectIds.length) {
      return NextResponse.json({ 
        error: 'Some subjects not found' 
      }, { status: 404 });
    }

    // Check if user already has access to any of these subjects
    const existingSubscriptions = await prisma.subscription.findMany({
      where: {
        userId: userId,
        subjectId: { in: selectedSubjectIds },
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      }
    });

    if (existingSubscriptions.length > 0) {
      const subscribedSubjectIds = existingSubscriptions.map(s => s.subjectId);
      const subscribedSubjectNames = subjects
        .filter(s => subscribedSubjectIds.includes(s.id))
        .map(s => s.name)
        .join(', ');
      
      return NextResponse.json({ 
        error: `You already have active subscriptions for: ${subscribedSubjectNames}` 
      }, { status: 409 });
    }

    // Check if user has full class access for any of these subjects
    const classIds = [...new Set(subjects.map(s => s.classId))];
    const classSubscriptions = await prisma.subscription.findMany({
      where: {
        userId: userId,
        classId: { in: classIds },
        subjectId: null,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      }
    });

    if (classSubscriptions.length > 0) {
      const classIdsWithAccess = classSubscriptions.map(s => s.classId);
      const subjectsWithClassAccess = subjects.filter(s => classIdsWithAccess.includes(s.classId));
      
      if (subjectsWithClassAccess.length > 0) {
        const subjectNames = subjectsWithClassAccess.map(s => s.name).join(', ');
        return NextResponse.json({ 
          error: `You already have full class access which includes: ${subjectNames}` 
        }, { status: 409 });
      }
    }

    // Calculate total price from all subjects or use provided amount
    const totalPrice = amount || subjects.reduce((sum, subject) => sum + (subject.price || 7500), 0);
    const subjectNames = subjects.map(s => s.name).join(', ');

    // Create payment order using unified service
    const orderResult = await createPaymentOrder({
      userId: userId,
      amount: totalPrice,
      currency: 'INR',
      description: selectedSubjectIds.length === 1 
        ? `${subjects[0].name} - Subject Subscription`
        : `${subjectNames} - Multiple Subject Subscription`
    });

    if (!orderResult) {
      return NextResponse.json({ 
        error: 'Payment order creation failed' 
      }, { status: 500 });
    }

    // Format response based on gateway
    if (orderResult.gateway === 'RAZORPAY') {
      return NextResponse.json({
        orderId: orderResult.orderData.id,
        amount: orderResult.orderData.amount,
        currency: orderResult.orderData.currency,
        keyId: orderResult.orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subjectIds: selectedSubjectIds,
        subjectNames: subjectNames,
        gateway: orderResult.gateway
      });
    } else if (orderResult.gateway === 'CASHFREE') {
      // For Cashfree, we might have different response structures
      const cashfreeResponse: {
        orderId: string;
        amount: number;
        currency: string;
        subjectIds: string[];
        subjectNames: string;
        gateway: string;
        environment?: string;
        payment_session_id?: string;
        checkout_url?: string;
        payment_link?: string;
      } = {
        orderId: orderResult.orderData.order_id,
        amount: orderResult.orderData.order_amount * 100, // Convert back to paise for frontend
        currency: orderResult.orderData.order_currency,
        subjectIds: selectedSubjectIds,
        subjectNames: subjectNames,
        gateway: orderResult.gateway
      };
      
      // Add environment info for frontend to use correct mode
      const config = await getPaymentConfig();
      cashfreeResponse.environment = config.cashfree.environment?.toLowerCase();
      
      // Add payment_session_id if available
      if (orderResult.orderData.payment_session_id) {
        cashfreeResponse.payment_session_id = orderResult.orderData.payment_session_id;
      }
      
      // Add checkout URL if available (alternative to payment_session_id)
      if (orderResult.orderData.checkout_url) {
        cashfreeResponse.checkout_url = orderResult.orderData.checkout_url;
      }
      
      // Add payment link if available
      if (orderResult.orderData.payment_link) {
        cashfreeResponse.payment_link = orderResult.orderData.payment_link;
      }
      
      console.log('[info] Cashfree payment response for subjects:', {
        subjectIds: selectedSubjectIds,
        totalAmount: totalPrice,
        response: cashfreeResponse
      });
      
      return NextResponse.json(cashfreeResponse);
    }

  } catch (error) {
    console.error('Subject payment creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment order' 
    }, { status: 500 });
  }
}
