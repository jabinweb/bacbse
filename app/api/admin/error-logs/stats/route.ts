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
      totalErrors,
      criticalErrors,
      errorsByLevel,
      errorsBySource,
      recentErrors
    ] = await Promise.all([
      prisma.errorLog.count(),
      prisma.errorLog.count({ where: { level: 'CRITICAL' } }),
      prisma.errorLog.groupBy({
        by: ['level'],
        _count: { level: true }
      }),
      prisma.errorLog.groupBy({
        by: ['source'],
        _count: { source: true },
        orderBy: { _count: { source: 'desc' } },
        take: 10
      }),
      prisma.errorLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    const levelStats = errorsByLevel.reduce((acc, item) => {
      acc[item.level] = item._count.level;
      return acc;
    }, {} as Record<string, number>);

    const sourceStats = errorsBySource.reduce((acc, item) => {
      acc[item.source] = item._count.source;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalErrors,
      criticalErrors,
      errorsByLevel: levelStats,
      errorsBySource: sourceStats,
      recentTrends: [{ date: new Date().toISOString(), count: recentErrors }]
    });

  } catch (error) {
    console.error('Error fetching error log stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error log stats' },
      { status: 500 }
    );
  }
}