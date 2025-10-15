import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all notifications for CSV export
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Format for CSV
    const csvData = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      isRead: notification.isRead,
      targetUserName: notification.user?.name || 'All Users',
      targetUserEmail: notification.user?.email || 'All Users',
      data: JSON.stringify(notification.data),
      expiresAt: notification.expiresAt?.toISOString() || 'No Expiry',
      createdAt: notification.created_at.toISOString(),
      updatedAt: notification.updatedAt.toISOString()
    }));

    // Generate CSV content
    const csvHeaders = [
      'ID', 'Title', 'Message', 'Type', 'Priority', 'Is Read',
      'Target User Name', 'Target User Email', 'Data', 'Expires At',
      'Created At', 'Updated At'
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => [
        row.id,
        `"${row.title}"`,
        `"${row.message}"`,
        row.type,
        row.priority,
        row.isRead,
        `"${row.targetUserName}"`,
        `"${row.targetUserEmail}"`,
        `"${row.data}"`,
        row.expiresAt,
        row.createdAt,
        row.updatedAt
      ].join(','))
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="notifications-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to export notifications' },
      { status: 500 }
    );
  }
}