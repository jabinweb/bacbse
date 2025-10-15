import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const level = searchParams.get('level');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;

    const where: Prisma.ErrorLogWhereInput = {};
    
    if (level && level !== 'ALL') {
      where.level = level;
    }
    
    if (source && source !== 'ALL') {
      where.source = source;
    }
    
    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [errorLogs, totalCount] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.errorLog.count({ where })
    ]);

    return NextResponse.json({
      errorLogs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Error fetching error logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error logs' },
      { status: 500 }
    );
  }
}