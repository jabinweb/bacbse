import { prisma } from '@/lib/prisma';
import { PaymentGateway, PaymentStatus } from '@prisma/client';
import Razorpay from 'razorpay';
import { validateCashfreeConfig } from '@/lib/cashfree-config';
import crypto from 'crypto';

// Types for payment creation
interface CreatePaymentOptions {
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
  gateway?: PaymentGateway;
}

interface PaymentGatewayConfig {
  defaultGateway: PaymentGateway;
  siteUrl: string;
  razorpay: {
    enabled: boolean;
    keyId?: string;
    keySecret?: string;
  };
  cashfree: {
    enabled: boolean;
    appId?: string;
    secretKey?: string;
    environment?: 'SANDBOX' | 'PRODUCTION';
  };
}

// Get payment configuration from AdminSettings
export const getPaymentConfig = async (): Promise<PaymentGatewayConfig> => {
  const settings = await prisma.adminSettings.findMany({
    where: {
      key: {
        in: [
          'payment_default_gateway',
          'payment_razorpay_enabled',
          'razorpayKeyId',
          'razorpayKeySecret',
          'razorpayTestKeyId',
          'razorpayTestKeySecret',
          'paymentMode',
          'payment_cashfree_enabled',
          'payment_cashfree_app_id',
          'payment_cashfree_secret_key',
          'payment_cashfree_test_app_id',
          'payment_cashfree_test_secret_key',
          'payment_cashfree_environment',
          'siteUrl'
        ]
      }
    }
  });

  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  // Log configuration for debugging (without sensitive data)
  console.log('[info] Payment config loaded:', {
    payment_default_gateway: settingsMap.payment_default_gateway,
    payment_cashfree_enabled: settingsMap.payment_cashfree_enabled,
    payment_cashfree_environment: settingsMap.payment_cashfree_environment,
    siteUrl: settingsMap.siteUrl,
    paymentMode: settingsMap.paymentMode,
    hasTestAppId: !!settingsMap.payment_cashfree_test_app_id,
    hasProdAppId: !!settingsMap.payment_cashfree_app_id,
    hasTestSecret: !!settingsMap.payment_cashfree_test_secret_key,
    hasProdSecret: !!settingsMap.payment_cashfree_secret_key
  });

  // Determine which Razorpay credentials to use based on payment mode
  const paymentMode = settingsMap.paymentMode || 'test';
  const razorpayKeyId = paymentMode === 'test' 
    ? settingsMap.razorpayTestKeyId 
    : settingsMap.razorpayKeyId;
  const razorpayKeySecret = paymentMode === 'test' 
    ? settingsMap.razorpayTestKeySecret 
    : settingsMap.razorpayKeySecret;

  // Determine which Cashfree credentials to use based on environment
  const cashfreeEnvironment = (settingsMap.payment_cashfree_environment as 'SANDBOX' | 'PRODUCTION') || 'SANDBOX';
  const cashfreeAppId = cashfreeEnvironment === 'SANDBOX' 
    ? settingsMap.payment_cashfree_test_app_id 
    : settingsMap.payment_cashfree_app_id;
  const cashfreeSecretKey = cashfreeEnvironment === 'SANDBOX' 
    ? settingsMap.payment_cashfree_test_secret_key 
    : settingsMap.payment_cashfree_secret_key;

  return {
    defaultGateway: (settingsMap.payment_default_gateway as PaymentGateway) || PaymentGateway.RAZORPAY,
    siteUrl: settingsMap.siteUrl || process.env.NEXTAUTH_URL || 'https://sciolabs.in',
    razorpay: {
      enabled: settingsMap.payment_razorpay_enabled === 'true',
      keyId: razorpayKeyId,
      keySecret: razorpayKeySecret,
    },
    cashfree: {
      enabled: settingsMap.payment_cashfree_enabled === 'true',
      appId: cashfreeAppId,
      secretKey: cashfreeSecretKey,
      environment: cashfreeEnvironment,
    }
  };
};

// Initialize payment gateways based on configuration
export const initializePaymentGateways = async () => {
  const config = await getPaymentConfig();
  
  const gateways: Record<string, Razorpay | boolean> = {};

  // Initialize Razorpay if enabled
  if (config.razorpay.enabled && config.razorpay.keyId && config.razorpay.keySecret) {
    try {
      gateways.razorpay = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });
    } catch (error) {
      console.error('Failed to initialize Razorpay:', error);
    }
  }

  // Initialize Cashfree if enabled
  if (config.cashfree.enabled && validateCashfreeConfig(config.cashfree.appId, config.cashfree.secretKey)) {
    try {
      // For API-based approach, we just validate credentials
      // No need to store SDK instance since we're using direct API calls
      gateways.cashfree = true;
    } catch (error) {
      console.error('Failed to validate Cashfree config:', error);
    }
  }

  return gateways;
};

// Create payment order
export const createPaymentOrder = async (options: CreatePaymentOptions) => {
  const config = await getPaymentConfig();
  const gateway = options.gateway || config.defaultGateway;
  
  // Check if the selected gateway is enabled
  if (gateway === PaymentGateway.RAZORPAY && !config.razorpay.enabled) {
    throw new Error('Razorpay is not enabled');
  }
  if (gateway === PaymentGateway.CASHFREE && !config.cashfree.enabled) {
    throw new Error('Cashfree is not enabled');
  }

  // Create payment record in database
  const payment = await prisma.payment.create({
    data: {
      userId: options.userId,
      gateway,
      amount: options.amount,
      currency: options.currency || 'INR',
      status: PaymentStatus.PENDING,
      description: options.description,
    },
  });

  let orderData;

  try {
    if (gateway === PaymentGateway.RAZORPAY) {
      orderData = await createRazorpayOrder(payment.id, options.amount, options.currency);
      
      // Update payment with Razorpay order ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { razorpayOrderId: orderData.id },
      });

    } else if (gateway === PaymentGateway.CASHFREE) {
      orderData = await createCashfreeOrder(payment.id, options.amount, options.currency, options.userId);
      
      // Update payment with Cashfree order ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { cashfreeOrderId: orderData.order_id },
      });
    }

    return {
      paymentId: payment.id,
      gateway,
      orderData,
    };

  } catch (error) {
    // Update payment status to failed
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: PaymentStatus.FAILED,
        failureReason: error instanceof Error ? error.message : 'Unknown error'
      },
    });
    throw error;
  }
};

// Create Razorpay order
const createRazorpayOrder = async (paymentId: string, amount: number, currency = 'INR') => {
  const config = await getPaymentConfig();
  
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new Error('Razorpay credentials not configured');
  }

  const razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });

  const order = await razorpay.orders.create({
    amount: amount, // Amount in paise
    currency,
    receipt: paymentId,
  });

  // Add key_id to the response for frontend use
  return {
    ...order,
    key_id: config.razorpay.keyId
  };
};

// Create Cashfree order using v2025-01-01 API
const createCashfreeOrder = async (paymentId: string, amount: number, currency = 'INR', userId: string) => {
  const config = await getPaymentConfig();
  
  if (!validateCashfreeConfig(config.cashfree.appId, config.cashfree.secretKey)) {
    throw new Error('Cashfree credentials not configured');
  }

  // Additional validation
  if (!config.cashfree.appId || config.cashfree.appId.length < 10) {
    throw new Error(`Invalid Cashfree App ID: ${config.cashfree.appId ? 'too short' : 'missing'}`);
  }
  
  if (!config.cashfree.secretKey || config.cashfree.secretKey.length < 10) {
    throw new Error(`Invalid Cashfree Secret Key: ${config.cashfree.secretKey ? 'too short' : 'missing'}`);
  }

  // Get user details for Cashfree order
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true },
  });

  if (!user || !user.email) {
    throw new Error('User details not found or incomplete');
  }

  // Determine the correct base URL based on environment
  const baseUrl = config.cashfree.environment === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';



  // Test basic connectivity first
  try {
    const connectivityTest = await fetch(baseUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    }).catch(() => null);
    
    console.log('[info] Cashfree API connectivity test:', {
      canConnect: !!connectivityTest,
      baseUrl
    });
  } catch (testError) {
    console.warn('[warning] Cashfree connectivity test failed, proceeding anyway:', testError);
  }

  const orderRequest = {
    order_amount: amount / 100, // Cashfree expects amount in rupees
    order_currency: currency,
    order_id: paymentId,
    customer_details: {
      customer_id: userId,
      customer_name: user.name || 'Customer',
      customer_email: user.email,
      customer_phone: user.phone || '9999999999',
    },
    order_meta: {
      return_url: `${config.siteUrl}/dashboard/payments?gateway=cashfree&order_id={order_id}&status={order_status}`,
    },
  };

  try {
    console.log('[info] Sending Cashfree order request:', {
      url: `${baseUrl}/orders`,
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': config.cashfree.appId?.substring(0, 8) + '...',
        'Content-Type': 'application/json'
      },
      orderAmount: orderRequest.order_amount,
      orderCurrency: orderRequest.order_currency,
      orderId: orderRequest.order_id
    });
    
    // Use the v2025-01-01 API directly with fetch
    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': config.cashfree.appId!,
        'x-client-secret': config.cashfree.secretKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRequest),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('[error] Cashfree API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Cashfree API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const orderData = await response.json();
    console.log('[info] Cashfree order created successfully:', { order_id: orderData.order_id });
    console.log('[info] Full Cashfree order response:', JSON.stringify(orderData, null, 2));
    
    // In modern Cashfree API, the payment_session_id should be in the order response
    // If it's not there, we might need to check the response structure or API version
    if (!orderData.payment_session_id) {
      console.warn('[warning] No payment_session_id in order response, checking alternative fields...');
      console.log('[debug] Available fields in response:', Object.keys(orderData));
      
      // Some possible alternative field names
      const possibleFields = ['payment_session_id', 'session_id', 'payment_link', 'checkout_url'];
      for (const field of possibleFields) {
        if (orderData[field]) {
          console.log(`[info] Found ${field}:`, orderData[field]);
        }
      }
    }
    
    return orderData;
  } catch (error) {
    console.error('[error] Cashfree order creation failed:', error);
    
    // Provide more specific error information
    if (error instanceof TypeError) {
      if (error.message.includes('fetch')) {
        console.error('[error] Network fetch error - possible causes:', {
          possibleCauses: [
            'Network connectivity issues',
            'DNS resolution failure',
            'Firewall blocking request',
            'Invalid API URL',
            'SSL/TLS certificate issues'
          ],
          baseUrl,
          configuredEnvironment: config.cashfree.environment
        });
        throw new Error(`Network error when connecting to Cashfree API: ${error.message}. Check network connectivity and API endpoint.`);
      }
    }
    
    if (error instanceof Error) {
      if (error.message.includes('AbortError')) {
        throw new Error(`Cashfree API request timeout: ${error.message}`);
      }
      
      if (error.message.includes('getaddrinfo ENOTFOUND')) {
        throw new Error(`DNS resolution failed for Cashfree API: ${baseUrl}. Check internet connectivity.`);
      }
    }
    
    throw new Error(`Failed to create Cashfree order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  const config = await getPaymentConfig();
  
  if (!config.razorpay.keySecret) {
    throw new Error('Razorpay key secret not configured');
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new Error('Invalid payment signature');
  }

  // Find payment record by Razorpay order ID
  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId },
  });

  if (!payment) {
    throw new Error('Payment record not found');
  }

  // Update payment record
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      razorpayPaymentId,
      razorpaySignature,
      status: PaymentStatus.COMPLETED,
    },
  });

  return updatedPayment;
};

// Verify Cashfree payment using v2025-01-01 API
export const verifyCashfreePayment = async (paymentId: string, orderId: string) => {
  const config = await getPaymentConfig();
  
  if (!validateCashfreeConfig(config.cashfree.appId, config.cashfree.secretKey)) {
    throw new Error('Cashfree credentials not configured');
  }

  // Determine the correct base URL based on environment
  const baseUrl = config.cashfree.environment === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

  try {
    // Use the v2025-01-01 API directly with fetch to get order details
    const response = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2025-01-01',
        'x-client-id': config.cashfree.appId!,
        'x-client-secret': config.cashfree.secretKey!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cashfree API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const orderData = await response.json();
    
    if (!orderData) {
      throw new Error('No order found');
    }

    // Check if order has successful payments
    if (orderData.order_status !== 'PAID') {
      throw new Error(`Payment status: ${orderData.order_status}`);
    }

    // Find payment record by ID (for Cashfree, paymentId is the database payment ID)
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        cashfreePaymentId: orderData.cf_order_id || `cf_payment_${Date.now()}`,
        status: PaymentStatus.COMPLETED,
        paymentMethod: 'Online', // Cashfree doesn't provide specific method in order details
      },
    });

    return updatedPayment;
  } catch (error) {
    console.error('Cashfree verification failed:', error);
    throw new Error(`Cashfree payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get available payment gateways
export const getAvailableGateways = async (): Promise<PaymentGateway[]> => {
  const config = await getPaymentConfig();
  const gateways: PaymentGateway[] = [];

  if (config.razorpay.enabled && config.razorpay.keyId && config.razorpay.keySecret) {
    gateways.push(PaymentGateway.RAZORPAY);
  }

  if (config.cashfree.enabled && validateCashfreeConfig(config.cashfree.appId, config.cashfree.secretKey)) {
    gateways.push(PaymentGateway.CASHFREE);
  }

  return gateways;
};