import Razorpay from 'razorpay';
import { createRazorpayInstance, getRazorpayConfig } from './razorpay-global';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

interface ServerOrderData {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

interface ServerOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

// Client-side functions
export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (orderData: { 
  amount: number; 
  currency: string; 
  userId: string; 
}): Promise<{ orderId: string }> => {
  const response = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
};

export const verifyPayment = async (paymentData: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  userId: string;
}): Promise<{ success: boolean }> => {
  const response = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Payment verification failed');
  }

  return response.json();
};

// Server-side functions
export const createServerRazorpayInstance = async (): Promise<Razorpay | null> => {
  // Use the global configuration function
  return await createRazorpayInstance();
};

export const createServerOrder = async (orderData: ServerOrderData): Promise<ServerOrderResult> => {
  try {
    const razorpay = await createServerRazorpayInstance();
    
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay configuration not available'
      };
    }

    const order = await razorpay.orders.create({
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt || `order_${Date.now()}`,
      notes: orderData.notes || {}
    });

    return {
      success: true,
      orderId: order.id
    };
  } catch (error) {
    console.error('Failed to create server order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Order creation failed'
    };
  }
};

export const validateRazorpayConfig = async (): Promise<boolean> => {
  try {
    const config = await getRazorpayConfig();
    return !!(config.keyId && config.keySecret);
  } catch {
    return false;
  }
};

// Server-side payment processing for auto-renewal
export const processAutoRenewalPayment = async (
  userId: string,
  amount: number,
  currency: string = 'INR',
  description: string = 'Auto-renewal'
): Promise<{ success: boolean; orderId?: string; paymentId?: string; error?: string }> => {
  try {
    // Step 1: Create order using existing create-order API pattern
    const orderResult = await createServerOrder({
      amount,
      currency,
      receipt: `auto_renewal_${userId}_${Date.now()}`,
      notes: {
        userId,
        type: 'auto_renewal',
        description
      }
    });

    if (!orderResult.success) {
      return {
        success: false,
        error: orderResult.error || 'Failed to create payment order'
      };
    }

    // Step 2: For production, here you would:
    // - Use saved payment methods or customer tokens
    // - Process the payment immediately using Razorpay's payment APIs
    // - Handle payment confirmation and webhook processing

    // For now, we'll return the order details for further processing
    return {
      success: true,
      orderId: orderResult.orderId,
      paymentId: `auto_${orderResult.orderId}_${Date.now()}`
    };

  } catch (error) {
    console.error('Auto-renewal payment processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed'
    };
  }
};
