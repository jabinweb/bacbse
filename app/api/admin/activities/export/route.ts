import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user activities for CSV export
    const activities = await prisma.userActivity.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Format for CSV
    const csvData = activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      description: activity.description,
      metadata: JSON.stringify(activity.metadata),
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      sessionId: activity.sessionId,
      userName: activity.user?.name || 'Unknown',
      userEmail: activity.user?.email || 'Unknown',
      createdAt: activity.created_at.toISOString()
    }));

    // Generate CSV content
    const csvHeaders = [
      'ID', 'Action', 'Description', 'Metadata',
      'IP Address', 'User Agent', 'Session ID', 'User Name', 'User Email',
      'Created At'
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => [
        row.id,
        row.action,
        `"${row.description}"`,
        `"${row.metadata}"`,
        row.ipAddress || '',
        `"${row.userAgent || ''}"`,
        row.sessionId || '',
        `"${row.userName}"`,
        `"${row.userEmail}"`,
        row.createdAt
      ].join(','))
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="activities-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting activities:', error);
    return NextResponse.json(
      { error: 'Failed to export activities' },
      { status: 500 }
    );
  }
}