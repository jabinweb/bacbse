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
      totalActivities,
      uniqueUsers,
      activitiesByAction,
      recentActivities,
      topUsers
    ] = await Promise.all([
      prisma.userActivity.count(),
      prisma.userActivity.findMany({
        distinct: ['userId'],
        select: { userId: true }
      }).then(users => users.length),
      prisma.userActivity.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } }
      }),
      prisma.userActivity.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.userActivity.groupBy({
        by: ['userId'],
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 5
      })
    ]);

    const actionStats = (activitiesByAction || []).reduce((acc, item) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {} as Record<string, number>);

    // Get user details for top users
    const topUserIds = topUsers.map(u => u.userId);
    const topUsersWithDetails = await prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: { id: true, name: true, email: true }
    });

    const topUsersFormatted = topUsers.map(userStat => {
      const user = topUsersWithDetails.find(u => u.id === userStat.userId);
      return {
        userId: userStat.userId,
        userName: user?.name || user?.email || 'Unknown User',
        count: userStat._count.userId
      };
    });

    return NextResponse.json({
      totalActivities: totalActivities || 0,
      uniqueUsers: uniqueUsers || 0,
      activitiesByAction: actionStats || {},
      recentTrends: [{ date: new Date().toISOString(), count: recentActivities || 0 }],
      topUsers: topUsersFormatted || []
    });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity stats' },
      { status: 500 }
    );
  }
}