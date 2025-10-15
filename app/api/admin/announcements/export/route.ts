import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all announcements for CSV export
    const announcements = await prisma.announcement.findMany({
      orderBy: { created_at: 'desc' }
    });

    // Format for CSV
    const csvData = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isActive: announcement.isActive,
      targetUsers: JSON.stringify(announcement.targetUsers),
      startDate: announcement.startDate?.toISOString() || 'No Start Date',
      endDate: announcement.endDate?.toISOString() || 'No End Date',
      createdAt: announcement.created_at.toISOString(),
      updatedAt: announcement.updatedAt.toISOString()
    }));

    // Generate CSV content
    const csvHeaders = [
      'ID', 'Title', 'Content', 'Type', 'Is Active',
      'Target Users', 'Start Date', 'End Date', 'Created At', 'Updated At'
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => [
        row.id,
        `"${row.title}"`,
        `"${row.content}"`,
        row.type,
        row.isActive,
        `"${row.targetUsers}"`,
        row.startDate,
        row.endDate,
        row.createdAt,
        row.updatedAt
      ].join(','))
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="announcements-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting announcements:', error);
    return NextResponse.json(
      { error: 'Failed to export announcements' },
      { status: 500 }
    );
  }
}