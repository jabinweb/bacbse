import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays, isBefore } from 'date-fns';
import { NotificationQueueType } from '@prisma/client';
import { verifyAdminOrCron } from '@/lib/admin-auth';

interface SubscriptionWithRelations {
  id: string;
  userId: string;
  endDate: Date | null;
  class?: {
    id: number;
    name: string;
  } | null;
  subject?: {
    id: string;
    name: string;
  } | null;
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
  };
}

interface ExpiryResult {
  processedCount: number;
  expiredCount: number;
  graceExtended: number;
  notificationsScheduled: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Use centralized admin/cron authentication
    const isAuthorized = await verifyAdminOrCron(request);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access or valid cron secret required' },
        { status: 401 }
      );
    }

    const result: ExpiryResult = {
      processedCount: 0,
      expiredCount: 0,
      graceExtended: 0,
      notificationsScheduled: 0,
      errors: []
    };

    const now = new Date();
    const gracePeriodDays = 7; // 7-day grace period
    const warningDays = [7, 3, 1]; // Send warnings 7, 3, and 1 days before expiry

    // Find all active subscriptions that need processing
    const subscriptionsToProcess = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: addDays(now, Math.max(...warningDays)) // Include subscriptions expiring within warning period
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    result.processedCount = subscriptionsToProcess.length;

    for (const subscription of subscriptionsToProcess) {
      try {
        const endDate = new Date(subscription.endDate!);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Handle already expired subscriptions
        if (isBefore(endDate, now)) {
          const daysSinceExpiry = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceExpiry <= gracePeriodDays) {
            // Still in grace period - extend with grace status
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'GRACE_PERIOD',
                updatedAt: now,
                endDate: addDays(endDate, gracePeriodDays) // Extend by grace period
              }
            });
            result.graceExtended++;

            // Schedule grace period notification
            await scheduleNotification(subscription, 'grace_period');
            result.notificationsScheduled++;
          } else {
            // Grace period expired - mark as expired
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'EXPIRED',
                updatedAt: now
              }
            });
            result.expiredCount++;

            // Schedule expiry notification
            await scheduleNotification(subscription, 'expired');
            result.notificationsScheduled++;
          }
        } 
        // Handle upcoming expiries (send warnings)
        else if (warningDays.includes(daysUntilExpiry)) {
          await scheduleNotification(subscription, 'expiry_warning', daysUntilExpiry);
          result.notificationsScheduled++;
        }

      } catch (error) {
        result.errors.push(`Error processing subscription ${subscription.id}: ${error}`);
      }
    }

    // Log the processing results
    console.log('Subscription expiry processing completed:', result);

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error in subscription expiry processing:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription expiries' },
      { status: 500 }
    );
  }
}

async function scheduleNotification(subscription: SubscriptionWithRelations, type: NotificationQueueType, daysUntilExpiry?: number) {
  try {
    // Skip notification if user has no email
    if (!subscription.user.email) {
      console.log(`Skipping notification for user ${subscription.userId} - no email address`);
      return;
    }

    // Create notification record for processing
    await prisma.notificationQueue.create({
      data: {
        userId: subscription.userId,
        type: type,
        data: {
          subscriptionId: subscription.id,
          className: subscription.class?.name,
          subjectName: subscription.subject?.name,
          endDate: subscription.endDate,
          daysUntilExpiry: daysUntilExpiry,
          userEmail: subscription.user.email,
          userName: subscription.user.displayName || subscription.user.email.split('@')[0]
        },
        status: 'PENDING',
        scheduledFor: new Date()
      }
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

// Manual trigger endpoint for testing
export async function GET() {
  try {
    // This is for manual testing by admin
    return NextResponse.json({
      message: "Use POST method to trigger subscription expiry processing",
      endpoint: "/api/admin/subscriptions/expire?secret=YOUR_CRON_SECRET"
    });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to get expiry handler info' },
      { status: 500 }
    );
  }
}