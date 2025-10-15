import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAuthenticatedUser() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { isValid: false, user: null };
    }

    // Get user from database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return { isValid: false, user: null };
    }

    return { isValid: true, user };
  } catch (error) {
    console.error('User authentication failed:', error);
    return { isValid: false, user: null };
  }
}


export async function POST(request: NextRequest) {
  try {
    const { isValid, user } = await getAuthenticatedUser();
    
    if (!isValid || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, topicId, rating, classId } = await request.json();

    // Validate input
    if (!userId || !topicId || !rating || !classId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Can only rate for your own account' }, { status: 403 });
    }

    // Check if the user has already rated this topic
    const existingRating = await prisma.topicDifficultyRating.findFirst({
      where: {
        userId: userId,
        topicId: topicId
      }
    });

    if (existingRating) {
      // Update existing rating
      await prisma.topicDifficultyRating.update({
        where: { id: existingRating.id },
        data: {
          rating: rating,
          updated_at: new Date()
        }
      });
    } else {
      // Create new rating
      await prisma.topicDifficultyRating.create({
        data: {
          userId: userId,
          topicId: topicId,
          rating: rating,
          classId: classId
        }
      });
    }

    return NextResponse.json({ 
      message: 'Rating saved successfully',
      action: existingRating ? 'updated' : 'created'
    });
  } catch (error) {
    console.error('Error in topic ratings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { isValid, user } = await getAuthenticatedUser();
    
    if (!isValid || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const classId = searchParams.get('classId');

    if (!topicId && !classId) {
      return NextResponse.json({ error: 'topicId or classId is required' }, { status: 400 });
    }

    if (topicId) {
      // Get specific topic rating averages
      const ratings = await prisma.topicDifficultyRating.findMany({
        where: { topicId: topicId },
        select: { rating: true, created_at: true }
      });

      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalRatings 
        : 0;

      return NextResponse.json({
        topicId,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings
      });
    } else if (classId) {
      // Get current user's ratings for a class
      const userRatings = await prisma.topicDifficultyRating.findMany({
        where: { 
          classId: parseInt(classId),
          userId: user.id  // Only get current user's ratings
        },
        select: { topicId: true, rating: true, created_at: true }
      });

      // Convert to the expected format
      const topicRatings = userRatings.map(rating => ({
        topicId: rating.topicId,
        userRating: rating.rating,  // Individual user rating, not average
        hasRated: true
      }));

      return NextResponse.json({ ratings: topicRatings });
    }
  } catch (error) {
    console.error('Error in GET topic ratings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}