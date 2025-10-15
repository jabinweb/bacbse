import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SubjectAccess {
  id: string;
  name: string;
  hasAccess: boolean;
  accessType: 'full';
  price?: number;
  currency?: string;
  canUpgrade?: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // Get class with subjects (no authentication required)
    const classData = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            orderIndex: true,
            price: true,
            currency: true,
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Grant full access to all subjects (no authentication required)
    const subjectAccess: SubjectAccess[] = classData.subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      hasAccess: true,
      accessType: 'full' as const,
      price: subject.price || undefined,
      currency: subject.currency,
      canUpgrade: false
    }));

    return NextResponse.json({
      classId: parseInt(classId),
      className: classData.name,
      classPrice: classData.price,
      hasFullAccess: true,
      accessType: 'full',
      subjectAccess,
      canUpgradeToClass: false,
      upgradeOptions: null
    });

  } catch (error) {
    console.error('Error in class access API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}