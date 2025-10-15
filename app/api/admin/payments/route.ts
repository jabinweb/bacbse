import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, PaymentGateway, PaymentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const gateway = searchParams.get('gateway');
    const userId = searchParams.get('userId');
    
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};
    
    if (status && status !== 'ALL') {
      where.status = status as PaymentStatus;
    }
    
    if (gateway && gateway !== 'ALL') {
      where.gateway = gateway as PaymentGateway;
    }
    
    if (userId) {
      where.userId = userId;
    }

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ]);

    return NextResponse.json({
      payments,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}