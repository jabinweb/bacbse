import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Create CSV content
    const headers = [
      'Payment ID', 'User Email', 'User Name', 'Gateway', 'Amount', 'Currency', 
      'Status', 'Payment Method', 'Description', 'Razorpay Payment ID', 
      'Cashfree Payment ID', 'Created At', 'Updated At', 'Failure Reason'
    ];

    const csvRows = [
      headers.join(','),
      ...payments.map(payment => [
        payment.id,
        payment.user.email || '',
        payment.user.name || '',
        payment.gateway,
        payment.amount,
        payment.currency,
        payment.status,
        payment.paymentMethod || '',
        payment.description || '',
        payment.razorpayPaymentId || '',
        payment.cashfreePaymentId || '',
        payment.created_at.toISOString(),
        payment.updatedAt.toISOString(),
        payment.failureReason || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="payments-export.csv"',
      },
    });

  } catch (error) {
    console.error('Error exporting payments:', error);
    return NextResponse.json(
      { error: 'Failed to export payments' },
      { status: 500 }
    );
  }
}