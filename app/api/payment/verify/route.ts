import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  verifyPaymentWithRetry, 
  createSubscriptionWithRetry, 
  sendNotificationEmailsWithRetry,
  paymentCircuitBreaker 
} from '@/lib/payment-retry-utils';
import { getAcademicYearEndDate } from '@/lib/subscription-date-utils';

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('[PaymentVerify] Starting payment verification process');
  
  try {
    const body = await req.json();
    const { paymentId, metadata } = body;
    console.log('[PaymentVerify] Request body received:', { paymentId: paymentId?.slice(0, 10) + '...', hasMetadata: !!metadata });

    if (!paymentId) {
      console.error('[PaymentVerify] Missing payment ID');
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Check if this is a Razorpay or Cashfree payment
    const isRazorpayPayment = body.razorpay_payment_id && body.razorpay_order_id && body.razorpay_signature;
    const isCashfreePayment = body.orderId;
    
    if (!isRazorpayPayment && !isCashfreePayment) {
      console.error('[PaymentVerify] Invalid payment verification request - missing required parameters');
      return NextResponse.json({ 
        error: 'Invalid payment verification request. Missing required parameters.' 
      }, { status: 400 });
    }

    console.log('[PaymentVerify] Payment type:', isRazorpayPayment ? 'Razorpay' : 'Cashfree');

    // Use circuit breaker and retry logic for payment verification
    const verificationResult = await paymentCircuitBreaker.execute(async () => {
      return await verifyPaymentWithRetry(body);
    });

    if (!verificationResult.success) {
      console.error('[PaymentVerify] Payment verification failed:', verificationResult.error);
      return NextResponse.json({ 
        verified: false,
        error: verificationResult.error 
      }, { status: 400 });
    }

    const payment = verificationResult.payment;
    console.log('[PaymentVerify] Payment verified successfully:', payment?.id);

    // If payment verification successful, create subscription based on metadata
    if (payment && payment.status === 'COMPLETED' && metadata) {
      console.log('[PaymentVerify] Creating subscription for metadata type:', metadata.type);
      
      // Create subscription with retry logic
      const subscriptionResult = await createSubscriptionWithRetry({ metadata, payment });
      
      if (!subscriptionResult.success) {
        console.error('[PaymentVerify] Subscription creation failed:', subscriptionResult.error);
        return NextResponse.json({ 
          error: subscriptionResult.error || 'Failed to create subscription' 
        }, { status: 500 });
      }

      // Send notification emails asynchronously (don't wait for completion)
      console.log('[PaymentVerify] Scheduling notification emails');
      setImmediate(async () => {
        try {
          // Fetch user and relevant data for emails
          const user = await prisma.user.findUnique({
            where: { id: metadata.userId },
            select: { email: true, displayName: true }
          });

          if (!user?.email) {
            console.log('[PaymentVerify] No user email found, skipping notifications');
            return;
          }

          let subscriptionDetails = {};
          
          if (metadata.type === 'class_subscription') {
            const classData = await prisma.class.findUnique({
              where: { id: metadata.classId },
              select: { name: true }
            });
            
            subscriptionDetails = {
              className: classData?.name || 'Unknown Class',
              subscriptionType: 'Class Access',
              subscriptionName: `${classData?.name} - Class Access`,
              endDate: getAcademicYearEndDate().toISOString()
            };
          } else if (metadata.type === 'subject_subscription') {
            const subjectIds: string[] = metadata.subjectIds || (metadata.subjectId ? [metadata.subjectId] : []);
            const subjects = await prisma.subject.findMany({
              where: { id: { in: subjectIds } },
              select: { name: true, class: { select: { name: true } } }
            });

            const subjectNames = subjects.map(s => s.name).join(', ');
            subscriptionDetails = {
              subjectName: subjectNames,
              className: subjects[0]?.class?.name || 'Unknown Class',
              subscriptionType: subjectIds.length === 1 ? 'Subject Access' : 'Multiple Subject Access',
              subscriptionName: subjectIds.length === 1 
                ? `${subjects[0]?.name} - Subject Access`
                : `${subjectNames} - Multiple Subject Access`,
              endDate: getAcademicYearEndDate().toISOString()
            };
          }

          await sendNotificationEmailsWithRetry({
            user: {
              email: user.email || undefined,
              displayName: user.displayName || undefined
            },
            subscriptionDetails,
            payment,
            paymentData: {
              paymentId: body.razorpay_payment_id || body.orderId || '',
              orderId: body.razorpay_order_id || body.orderId || ''
            }
          });
        } catch (emailError) {
          console.error('[PaymentVerify] Failed to send notification emails:', emailError);
        }
      });
    }

    // If payment verification successful, return success
    if (payment && payment.status === 'COMPLETED') {
      const processingTime = Date.now() - Date.now();
      console.log(`[PaymentVerify] Payment verification completed successfully in ${processingTime}ms`);
      
      return NextResponse.json({ 
        verified: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency
        }
      });
    } else {
      console.error('[PaymentVerify] Payment verification failed - payment not completed');
      return NextResponse.json({ 
        verified: false,
        error: 'Payment verification failed'
      }, { status: 400 });
    }

  } catch (error) {
    const processingTime = Date.now() - Date.now();
    console.error(`[PaymentVerify] Payment verification error after ${processingTime}ms:`, error);
    
    // Handle circuit breaker errors
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      console.error('[PaymentVerify] Circuit breaker is open - too many failures');
      return NextResponse.json({ 
        error: 'Service temporarily unavailable. Please try again later.' 
      }, { status: 503 });
    }
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Invalid payment signature') || 
          error.message.includes('Payment status:')) {
        return NextResponse.json({ 
          verified: false,
          error: error.message 
        }, { status: 400 });
      }
      
      if (error.message.includes('not configured')) {
        return NextResponse.json({ 
          error: 'Payment gateway not configured' 
        }, { status: 503 });
      }
      
      if (error.message.includes('timeout') || 
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('ECONNRESET')) {
        return NextResponse.json({ 
          error: 'Request timeout. Payment verification may have succeeded - please check your account or contact support.' 
        }, { status: 408 });
      }
    }

    const duration = Date.now() - startTime;
    console.error(`[PaymentVerify] Verification failed after ${duration}ms`);
    
    return NextResponse.json({ 
      error: 'Payment verification failed. Please contact support if payment was deducted.' 
    }, { status: 500 });
  }
}
