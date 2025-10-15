import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete error logs older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const deletedCount = await prisma.errorLog.deleteMany({
      where: {
        timestamp: {
          lt: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({
      message: 'Old error logs cleaned up successfully',
      deletedCount: deletedCount.count
    });

  } catch (error) {
    console.error('Error cleaning up error logs:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup error logs' },
      { status: 500 }
    );
  }
}