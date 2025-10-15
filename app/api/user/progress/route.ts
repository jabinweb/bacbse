import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const progress = await prisma.userTopicProgress.findMany({
      where: { userId },
      include: {
        topic: {
          include: {
            chapter: {
              include: {
                subject: {
                  include: {
                    class: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, topicId, completed } = await request.json();

    if (!userId || !topicId) {
      return NextResponse.json({ error: 'User ID and Topic ID are required' }, { status: 400 });
    }

    const progress = await prisma.userTopicProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        topicId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
