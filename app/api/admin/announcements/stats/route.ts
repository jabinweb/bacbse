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
      totalAnnouncements,
      activeCount,
      inactiveCount,
      byType,
      scheduledCount,
      expiredCount,
      recentCount
    ] = await Promise.all([
      prisma.announcement.count(),
      prisma.announcement.count({ where: { isActive: true } }),
      prisma.announcement.count({ where: { isActive: false } }),
      prisma.announcement.groupBy({
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } }
      }),
      prisma.announcement.count({
        where: {
          startDate: { gte: new Date() },
          isActive: false
        }
      }),
      prisma.announcement.count({
        where: {
          endDate: { lt: new Date() },
          isActive: true
        }
      }),
      prisma.announcement.count({
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

    return NextResponse.json({
      totalAnnouncements: totalAnnouncements || 0,
      activeCount: activeCount || 0,
      inactiveCount: inactiveCount || 0,
      activePercentage: totalAnnouncements > 0 ? 
        (activeCount / totalAnnouncements * 100).toFixed(1) : 0,
      announcementsByType: typeStats || {},
      scheduledCount: scheduledCount || 0,
      expiredCount: expiredCount || 0,
      recentTrends: [{ date: new Date().toISOString(), count: recentCount || 0 }]
    });

  } catch (error) {
    console.error('Error fetching announcement stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcement stats' },
      { status: 500 }
    );
  }
}