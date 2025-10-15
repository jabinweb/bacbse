import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user's subscriptions with related data
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: userId
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Format the response
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      planType: sub.planType,
      status: sub.status,
      startDate: sub.startDate.toISOString(),
      endDate: sub.endDate?.toISOString() || null,
      amount: sub.amount,
      className: sub.class?.name,
      subjectName: sub.subject?.name,
      createdAt: sub.created_at.toISOString()
    }));

    return NextResponse.json({
      success: true,
      subscriptions: formattedSubscriptions
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}