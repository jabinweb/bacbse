import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Next.js 15: params is a Promise and must be awaited
export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;

  try {
    // Return structure without actual content data
    const classData = await prisma.class.findUnique({
      where: {
        id: parseInt(classId)
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        currency: true,
        price: true,
        subjects: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            isLocked: true,
            orderIndex: true,
            currency: true,
            price: true,
            chapters: {
              select: {
                id: true,
                name: true,
                orderIndex: true,
                topics: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    duration: true,
                    orderIndex: true,
                    description: true,
                    difficulty: true,
                    // Exclude content - this protects the data
                  },
                  orderBy: { orderIndex: 'asc' },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class data:', error);
    return NextResponse.json({ error: 'Failed to fetch class data' }, { status: 500 });
  }
}
