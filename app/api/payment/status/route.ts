import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PaymentHealthCheck, PaymentLogger } from '@/lib/payment-monitoring';

// Payment status and health monitoring endpoint
export async function GET(request: Request) {
  const session = await auth();
  
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const userId = searchParams.get('userId');
    const healthCheck = searchParams.get('health') === 'true';

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'ADMIN';

    // Health check endpoint for admins
    if (healthCheck && isAdmin) {
      const health = await PaymentHealthCheck.checkSystemHealth();
      return NextResponse.json({ health });
    }

    // Get specific payment status
    if (paymentId) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: {
            select: { id: true, email: true, displayName: true }
          }
        }
      });

      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Check authorization
      if (payment.userId !== session.user.id && !isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Check for associated subscriptions
      const subscriptions = await prisma.subscription.findMany({
        where: {
          userId: payment.userId,
          created_at: {
            gte: new Date(payment.created_at.getTime() - 5 * 60 * 1000), // 5 minutes before payment
            lte: new Date(payment.created_at.getTime() + 60 * 60 * 1000) // 1 hour after payment
          }
        },
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true } }
        }
      });

      return NextResponse.json({
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          createdAt: payment.created_at,
          updatedAt: payment.updatedAt,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
          cashfreeOrderId: payment.cashfreeOrderId,
          metadata: payment.metadata
        },
        subscriptions: subscriptions.map(sub => ({
          id: sub.id,
          status: sub.status,
          planType: sub.planType,
          startDate: sub.startDate,
          endDate: sub.endDate,
          className: sub.class?.name,
          subjectName: sub.subject?.name
        })),
        user: isAdmin ? payment.user : undefined
      });
    }

    // Get user's payment history
    const targetUserId = isAdmin && userId ? userId : session.user.id;
    
    const payments = await prisma.payment.findMany({
      where: { userId: targetUserId },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        user: isAdmin ? {
          select: { id: true, email: true, displayName: true }
        } : false
      }
    });

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: targetUserId },
      orderBy: { created_at: 'desc' },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } }
      }
    });

    return NextResponse.json({
      payments: payments.map(payment => ({
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        gateway: payment.gateway,
        createdAt: payment.created_at,
        updatedAt: payment.updatedAt,
        user: isAdmin && payment.user ? payment.user : undefined
      })),
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        planType: sub.planType,
        startDate: sub.startDate,
        endDate: sub.endDate,
        className: sub.class?.name,
        subjectName: sub.subject?.name,
        isActive: sub.status === 'ACTIVE' && sub.endDate && sub.endDate > new Date()
      }))
    });

  } catch (error) {
    PaymentLogger.error(
      'PaymentStatus', 
      'Failed to fetch payment status', 
      error instanceof Error ? error : new Error('Unknown error'),
      { endpoint: '/api/payment/status' },
      session?.user?.id
    );

    return NextResponse.json({
      error: 'Failed to fetch payment status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}