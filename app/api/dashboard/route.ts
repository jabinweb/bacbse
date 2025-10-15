import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all classes with their subjects, chapters, and topics (no authentication required)
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      include: {
        subjects: {
          include: {
            chapters: {
              include: {
                topics: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    duration: true,
                    description: true,
                    difficulty: true,
                    orderIndex: true
                  },
                  orderBy: { orderIndex: 'asc' }
                }
              },
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Transform classes to include full access for all content
    const classesWithAccess = classes.map((cls) => {
      const subjectsWithAccess = cls.subjects.map((subject) => ({
        ...subject,
        hasAccess: true, // Grant access to all subjects
        accessType: 'full'
      }));

      return {
        ...cls,
        subjects: subjectsWithAccess,
        schoolAccess: true,
        subscriptionAccess: true,
        hasPartialAccess: false,
        accessType: 'full',
        subjectAccess: subjectsWithAccess.reduce((acc, subject) => {
          acc[subject.id] = {
            hasAccess: true,
            accessType: 'full'
          };
          return acc;
        }, {} as Record<string, { hasAccess: boolean; accessType: string }>)
      };
    });

    return NextResponse.json({
      classes: classesWithAccess,
      userProfile: null, // No user profile needed
      accessMessage: "✓ Full Access: All content is available",
      accessType: 'full'
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}