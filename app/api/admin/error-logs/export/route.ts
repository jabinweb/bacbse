import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const errorLogs = await prisma.errorLog.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Create CSV content
    const headers = [
      'ID', 'Level', 'Source', 'Message', 'User ID', 'Payment ID', 
      'Timestamp', 'Details', 'Stack'
    ];

    const csvRows = [
      headers.join(','),
      ...errorLogs.map(log => [
        log.id,
        log.level,
        log.source,
        log.message,
        log.userId || '',
        log.paymentId || '',
        log.timestamp.toISOString(),
        log.details || '',
        log.stack || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="error-logs-export.csv"',
      },
    });

  } catch (error) {
    console.error('Error exporting error logs:', error);
    return NextResponse.json(
      { error: 'Failed to export error logs' },
      { status: 500 }
    );
  }
}