import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
  
      const accessibleClasses = await prisma.class.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          price: true
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      const accessType = 'full';
      const message = 'You have access to all classes with your active subscription.';

    return NextResponse.json({
      accessibleClasses,
      accessType,
      message,
      // hasActiveSubscription: !!subscription
    });

  } catch (error) {
    console.error('Error fetching accessible classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accessible classes' },
      { status: 500 }
    );
  }
}