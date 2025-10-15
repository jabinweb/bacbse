import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { logTopicCompleted } from '@/lib/activity-logger';

const prisma = new PrismaClient();

// GET - Fetch user's topic progress
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch all user topic progress
    const progress = await prisma.userTopicProgress.findMany({
      where: {
        userId: userId
      },
      select: {
        topicId: true,
        completed: true,
        completedAt: true
      }
    });

    // Convert to Map format expected by the hook
    const progressMap: Record<string, boolean> = {};
    progress.forEach((item) => {
      progressMap[item.topicId.toString()] = item.completed;
    });

    return NextResponse.json({
      progress: progressMap,
      progressList: progress
    });

  } catch (error) {
    console.error('Error fetching topic progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic progress' },
      { status: 500 }
    );
  }
}

// POST - Update user's topic progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { topicId, completed = true } = body;

    if (!topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const topicIdString = topicId.toString();

    // Check if progress record already exists
    const existingProgress = await prisma.userTopicProgress.findUnique({
      where: {
        userId_topicId: {
          userId: userId,
          topicId: topicIdString
        }
      }
    });

    let result;
    
    if (existingProgress) {
      // Update existing record
      result = await prisma.userTopicProgress.update({
        where: {
          userId_topicId: {
            userId: userId,
            topicId: topicIdString
          }
        },
        data: {
          completed: completed,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new record
      result = await prisma.userTopicProgress.create({
        data: {
          userId: userId,
          topicId: topicIdString,
          completed: completed,
          completedAt: completed ? new Date() : null,
          created_at: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Log topic completion activity if completed
    if (completed && result.completed) {
      // Get topic name for logging
      const topic = await prisma.topic.findUnique({
        where: { id: topicIdString },
        select: { name: true }
      });
      
      if (topic) {
        await logTopicCompleted(userId, topicIdString, topic.name);
      }
    }

    return NextResponse.json({
      success: true,
      progress: {
        topicId: result.topicId,
        completed: result.completed,
        completedAt: result.completedAt
      }
    });

  } catch (error) {
    console.error('Error updating topic progress:', error);
    return NextResponse.json(
      { error: 'Failed to update topic progress' },
      { status: 500 }
    );
  }
}