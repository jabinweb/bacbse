import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, addDays } from 'date-fns';

interface DailySubscriptionResult {
  date: Date;
  new_subscriptions: bigint;
  daily_revenue: bigint;
}

interface DailyExpiryResult {
  date: Date;
  expired_subscriptions: bigint;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days or 'month'
    
    const now = new Date();
    const daysAgo = parseInt(period);
    const startDate = period === 'month' 
      ? startOfMonth(subMonths(now, 1))
      : startOfDay(addDays(now, -daysAgo));
    const endDate = endOfDay(now);

    // Get subscription metrics
    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      graceSubscriptions,
      recentSubscriptions,
      expiringSubscriptions,
      revenueData,
      subscriptionsByStatus,
      subscriptionsByType,
      churnData
    ] = await Promise.all([
      // Total subscriptions
      prisma.subscription.count(),
      
      // Active subscriptions
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          endDate: { gt: now }
        }
      }),
      
      // Expired subscriptions
      prisma.subscription.count({
        where: {
          status: 'EXPIRED'
        }
      }),
      
      // Grace period subscriptions
      prisma.subscription.count({
        where: {
          status: 'GRACE_PERIOD'
        }
      }),
      
      // Recent subscriptions (last 30 days)
      prisma.subscription.count({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Expiring in next 7 days
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: now,
            lte: addDays(now, 7)
          }
        }
      }),
      
      // Revenue data
      prisma.subscription.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: { in: ['ACTIVE', 'EXPIRED'] },
          created_at: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Subscriptions by status
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // Subscriptions by type
      prisma.subscription.groupBy({
        by: ['planType'],
        _count: true
      }),
      
      // Churn data (cancellations and expirations in period)
      prisma.subscription.count({
        where: {
          OR: [
            { status: 'CANCELLED' },
            { status: 'EXPIRED' }
          ],
          updatedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ]);

    // Calculate growth metrics
    const previousPeriodStart = period === 'month' 
      ? startOfMonth(subMonths(now, 2))
      : startOfDay(addDays(startDate, -daysAgo));
    const previousPeriodEnd = period === 'month'
      ? endOfMonth(subMonths(now, 2))
      : startOfDay(addDays(startDate, -1));

    const previousPeriodSubscriptions = await prisma.subscription.count({
      where: {
        created_at: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    });

    const growthRate = previousPeriodSubscriptions > 0 
      ? ((recentSubscriptions - previousPeriodSubscriptions) / previousPeriodSubscriptions * 100)
      : 0;

    // Get daily subscription data for charts
    const dailyData = await getDailySubscriptionData(startDate, endDate);

    // Get top performing classes/subjects
    const topPerformers = await prisma.subscription.groupBy({
      by: ['classId', 'subjectId'],
      _count: {
        id: true
      },
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Calculate churn rate
    const churnRate = activeSubscriptions > 0 ? (churnData / activeSubscriptions * 100) : 0;

    // Calculate average revenue per user (ARPU)
    const totalRevenue = revenueData._sum.amount || 0;
    const arpu = recentSubscriptions > 0 ? totalRevenue / recentSubscriptions / 100 : 0; // Convert from paisa to rupees

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSubscriptions,
          activeSubscriptions,
          expiredSubscriptions,
          graceSubscriptions,
          recentSubscriptions,
          expiringSubscriptions,
          growthRate: Number(growthRate.toFixed(2)),
          churnRate: Number(churnRate.toFixed(2)),
          totalRevenue: totalRevenue / 100, // Convert to rupees
          arpu: Number(arpu.toFixed(2))
        },
        charts: {
          subscriptionsByStatus: subscriptionsByStatus.map(item => ({
            status: item.status,
            count: item._count,
            percentage: Number((item._count / totalSubscriptions * 100).toFixed(1))
          })),
          subscriptionsByType: subscriptionsByType.map(item => ({
            type: item.planType,
            count: item._count,
            percentage: Number((item._count / totalSubscriptions * 100).toFixed(1))
          })),
          dailyData
        },
        insights: {
          topPerformers: topPerformers.map(item => ({
            classId: item.classId,
            subjectId: item.subjectId,
            count: item._count.id
          })),
          churnData,
          revenueGrowth: growthRate,
          customerLifetimeValue: arpu * 12 // Assuming annual retention
        }
      }
    });

  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

async function getDailySubscriptionData(startDate: Date, endDate: Date) {
  const dailySubscriptions = await prisma.$queryRaw<DailySubscriptionResult[]>`
    SELECT 
      DATE("created_at") as date,
      COUNT(*) as new_subscriptions,
      SUM("amount") as daily_revenue
    FROM "subscriptions" 
    WHERE "created_at" >= ${startDate} AND "created_at" <= ${endDate}
    GROUP BY DATE("created_at")
    ORDER BY date ASC
  `;

  const dailyExpiries = await prisma.$queryRaw<DailyExpiryResult[]>`
    SELECT 
      DATE("endDate") as date,
      COUNT(*) as expired_subscriptions
    FROM "subscriptions" 
    WHERE "endDate" >= ${startDate} AND "endDate" <= ${endDate}
    AND "status" IN ('EXPIRED', 'CANCELLED')
    GROUP BY DATE("endDate")
    ORDER BY date ASC
  `;

  // Combine the data
  const dateMap = new Map();
  
  // Initialize with subscription data
  dailySubscriptions.forEach(item => {
    const dateStr = item.date.toISOString().split('T')[0];
    dateMap.set(dateStr, {
      date: dateStr,
      newSubscriptions: Number(item.new_subscriptions),
      dailyRevenue: Number(item.daily_revenue) / 100, // Convert to rupees
      expiredSubscriptions: 0
    });
  });

  // Add expiry data
  dailyExpiries.forEach(item => {
    const dateStr = item.date.toISOString().split('T')[0];
    if (dateMap.has(dateStr)) {
      dateMap.get(dateStr).expiredSubscriptions = Number(item.expired_subscriptions);
    } else {
      dateMap.set(dateStr, {
        date: dateStr,
        newSubscriptions: 0,
        dailyRevenue: 0,
        expiredSubscriptions: Number(item.expired_subscriptions)
      });
    }
  });

  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}