import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/payment-service';

// Payment gateway types
const PAYMENT_GATEWAYS = ['RAZORPAY', 'CASHFREE'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, currency = 'INR', description, gateway } = body;

    // Validate required fields
    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'User ID and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate gateway if provided
    if (gateway && !PAYMENT_GATEWAYS.includes(gateway)) {
      return NextResponse.json(
        { error: 'Invalid payment gateway specified' },
        { status: 400 }
      );
    }

    // Create payment order using the payment service
    const paymentOrder = await createPaymentOrder({
      userId,
      amount,
      currency,
      description,
      gateway,
    });

    return NextResponse.json({
      success: true,
      data: paymentOrder,
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Payment gateway not enabled') || 
          error.message.includes('not configured')) {
        return NextResponse.json(
          { error: error.message },
          { status: 503 }
        );
      }
      
      if (error.message.includes('User not found')) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
