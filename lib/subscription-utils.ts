import { prisma } from '@/lib/prisma';
import { Subscription, Class, Subject } from '@prisma/client';

export interface UserAccess {
  hasClassAccess: boolean;
  hasSubjectAccess: boolean;
  accessType: 'none' | 'subject' | 'class' | 'premium';
  subscription?: Subscription & {
    class?: Class | null;
    subject?: Subject | null;
  };
}

// Check if user has access to specific content
export async function checkUserAccess(
  userId: string, 
  classId: number, 
  subjectId?: string
): Promise<UserAccess> {
  try {
    // Check for active class subscription (full access)
    const classSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        classId,
        subjectId: null,
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        }
      },
      include: {
        class: true
      }
    });

    if (classSubscription) {
      return {
        hasClassAccess: true,
        hasSubjectAccess: true,
        accessType: 'class',
        subscription: classSubscription
      };
    }

    // If checking for specific subject access
    if (subjectId) {
      const subjectSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          subjectId,
          status: 'ACTIVE',
          endDate: {
            gt: new Date()
          }
        },
        include: {
          subject: true
        }
      });

      if (subjectSubscription) {
        return {
          hasClassAccess: false,
          hasSubjectAccess: true,
          accessType: 'subject',
          subscription: subjectSubscription
        };
      }
    }

    // Check for premium/global subscription
    const premiumSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        classId: null,
        subjectId: null,
        status: 'ACTIVE',
        planType: {
          in: ['premium', 'annual', 'unlimited']
        },
        endDate: {
          gt: new Date()
        }
      }
    });

    if (premiumSubscription) {
      return {
        hasClassAccess: true,
        hasSubjectAccess: true,
        accessType: 'premium',
        subscription: premiumSubscription
      };
    }

    return {
      hasClassAccess: false,
      hasSubjectAccess: false,
      accessType: 'none'
    };
  } catch (error) {
    console.error('Error checking user access:', error);
    return {
      hasClassAccess: false,
      hasSubjectAccess: false,
      accessType: 'none'
    };
  }
}

// Get all user's active subscriptions with details
export async function getUserSubscriptions(userId: string) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        }
      },
      include: {
        class: true,
        subject: true,
        upgradedFrom: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return subscriptions;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return [];
  }
}

// Check if user can upgrade from subject to class
export async function canUpgradeToClass(userId: string, classId: number) {
  try {
    // Check if user has any subject subscriptions for this class
    const subjectSubscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        },
        subject: {
          classId
        }
      },
      include: {
        subject: true
      }
    });

    // Check if user already has class subscription
    const classSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        classId,
        subjectId: null,
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        }
      }
    });

    return {
      canUpgrade: subjectSubscriptions.length > 0 && !classSubscription,
      currentSubjectSubscriptions: subjectSubscriptions,
      hasClassSubscription: !!classSubscription
    };
  } catch (error) {
    console.error('Error checking upgrade eligibility:', error);
    return {
      canUpgrade: false,
      currentSubjectSubscriptions: [],
      hasClassSubscription: false
    };
  }
}
