import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import { generateEmailContent } from '@/lib/email';

interface ProcessNotificationResult {
  processedCount: number;
  sentCount: number;
  failedCount: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access or use cron secret
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('secret');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const result: ProcessNotificationResult = {
      processedCount: 0,
      sentCount: 0,
      failedCount: 0,
      errors: []
    };

    // Get pending notifications that are ready to be sent
    const pendingNotifications = await prisma.notificationQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: new Date()
        },
        retryCount: {
          lt: 3 // Max 3 retries
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true
          }
        }
      },
      take: 50 // Process in batches
    });

    result.processedCount = pendingNotifications.length;

    for (const notification of pendingNotifications) {
      try {
        // Mark as processing
        await prisma.notificationQueue.update({
          where: { id: notification.id },
          data: { status: 'PROCESSING' }
        });

        // Convert Prisma JsonValue to EmailData with proper type checking
        const emailData = (notification.data as Record<string, unknown>) || {};
        
        // Generate email content based on notification type
        const emailContent = generateEmailContent(notification.type, emailData);
        
        // Send email
        await sendEmail({
          to: notification.user.email || '',
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        // Mark as sent
        await prisma.notificationQueue.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            processedAt: new Date()
          }
        });

        result.sentCount++;

      } catch (error) {
        // Mark as failed and increment retry count
        await prisma.notificationQueue.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            retryCount: { increment: 1 },
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });

        result.failedCount++;
        result.errors.push(`Notification ${notification.id}: ${error}`);
      }
    }

    console.log('Notification processing completed:', result);

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error in notification processing:', error);
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET() {
  return NextResponse.json({
    message: "Use POST method to trigger notification processing",
    endpoint: "/api/admin/notifications/process?secret=YOUR_CRON_SECRET"
  });
}