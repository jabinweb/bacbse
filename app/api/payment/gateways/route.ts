import { NextResponse } from 'next/server';
import { getAvailableGateways } from '@/lib/payment-service';

export async function GET() {
  try {
    const gateways = await getAvailableGateways();
    
    return NextResponse.json({
      success: true,
      gateways
    });
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment gateways' },
      { status: 500 }
    );
  }
}