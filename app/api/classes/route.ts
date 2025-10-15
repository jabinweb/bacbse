import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Return structure without actual content data
    const classes = await prisma.class.findMany({
      where: { isActive: true },
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
                    // Exclude content - this is the key change
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
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
