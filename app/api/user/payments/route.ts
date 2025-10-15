import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

interface PaymentWhereClause {
  userId: string;
  status?: PaymentStatus;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // Filter by payment status
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const whereClause: PaymentWhereClause = {
      userId: userId
    };

    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase() as PaymentStatus;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch payments
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.payment.count({
        where: whereClause
      })
    ]);

    // Format the response
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      razorpayPaymentId: payment.razorpayPaymentId,
      razorpayOrderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      failureReason: payment.failureReason,
      createdAt: payment.created_at.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}