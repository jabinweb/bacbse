import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalPayments,
      completedPayments,
      totalRevenue,
      failedPayments,
      pendingPayments,
      refundedPayments
    ] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.payment.count({ where: { status: 'FAILED' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'REFUNDED' } })
    ]);

    const successRate = totalPayments > 0 
      ? (completedPayments / totalPayments) * 100 
      : 0;

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPayments,
      successfulPayments: completedPayments,
      failedPayments,
      pendingPayments,
      refundedPayments,
      successRate: Math.round(successRate * 100) / 100
    });

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment stats' },
      { status: 500 }
    );
  }
}