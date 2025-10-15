import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SubjectAccess {
  id: string;
  name: string;
  hasAccess: boolean;
  accessType: 'school' | 'class_subscription' | 'subject_subscription' | 'none';
  price?: number;
  currency?: string;
  canUpgrade?: boolean;
}

interface DbSubject {
  id: string;
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
  price: number | null;
  currency: string;
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
      where: { 
        id: parseInt(classId),
        isActive: true
      },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            orderIndex: true,
            price: true,
            currency: true
          }
        }
      }
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Grant full access to all subjects (no authentication required)
    const subjectAccess: SubjectAccess[] = classData.subjects.map((subject: DbSubject) => ({
      select: {
        classId: true,
        subjectId: true,
        planType: true,
        status: true,
        endDate: true
      }
    });

    // Check for class-wide subscription
    const classSubscription = subscriptions?.find((s) => 
      s.classId === parseInt(classId) && !s.subjectId
    );

    // Check for subject-specific subscriptions
    const subjectSubscriptions = new Map(
      subscriptions?.filter((s) => s.subjectId).map((s) => [s.subjectId, s]) || []
    );

    // Check school access
    const gradeToClassMap: Record<string, number[]> = {
      '5': [5], '6': [6], '7': [7], '8': [8], '9': [9], '10': [10]
    };
    const hasSchoolAccess = user.school?.isActive && user.grade && 
      (gradeToClassMap[user.grade] || []).includes(parseInt(classId));

    // Build subject access information
    const subjectAccess: SubjectAccess[] = classData.subjects.map((subject: DbSubject) => {
      const hasSubjectSubscription = subjectSubscriptions.has(subject.id);
      const hasAccess = hasSchoolAccess || !!classSubscription || hasSubjectSubscription;
      
      let accessType: SubjectAccess['accessType'] = 'none';
      if (hasSchoolAccess) accessType = 'school';
      else if (classSubscription) accessType = 'class_subscription';
      else if (hasSubjectSubscription) accessType = 'subject_subscription';

      return {
        id: subject.id,
        name: subject.name,
        hasAccess,
        accessType,
        price: subject.price || undefined,
        currency: subject.currency,
        canUpgrade: hasSubjectSubscription && !classSubscription // Can upgrade from subject to class
      };
    });

    return NextResponse.json({
      classId: parseInt(classId),
      className: classData.name,
      classPrice: classData.price,
      hasFullAccess: hasSchoolAccess || !!classSubscription,
      accessType: hasSchoolAccess ? 'school' : classSubscription ? 'class_subscription' : 'partial',
      subjectAccess,
      canUpgradeToClass: subjectSubscriptions.size > 0 && !classSubscription,
      upgradeOptions: subjectSubscriptions.size > 0 && !classSubscription && classData.price ? {
        currentSubjects: Array.from(subjectSubscriptions.keys()),
        classPrice: classData.price,
        potentialSavings: (subjectSubscriptions.size * Math.ceil(classData.price / classData.subjects.length)) - classData.price
      } : null
    });

  } catch (error) {
    console.error('Error in class access API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
