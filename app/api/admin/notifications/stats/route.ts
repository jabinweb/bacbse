import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalNotifications,
      unreadCount,
      byType,
      byPriority,
      recentCount
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({
        where: { isRead: false }
      }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } }
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        _count: { priority: true },
        orderBy: { _count: { priority: 'desc' } }
      }),
      prisma.notification.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    const typeStats = (byType || []).reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    const priorityStats = (byPriority || []).reduce((acc, item) => {
      acc[item.priority] = item._count.priority;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalNotifications: totalNotifications || 0,
      unreadNotifications: unreadCount || 0,
      readPercentage: totalNotifications > 0 ? 
        ((totalNotifications - unreadCount) / totalNotifications * 100).toFixed(1) : 0,
      notificationsByType: typeStats || {},
      notificationsByPriority: priorityStats || {},
      recentTrends: [{ date: new Date().toISOString(), count: recentCount || 0 }]
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification stats' },
      { status: 500 }
    );
  }
}