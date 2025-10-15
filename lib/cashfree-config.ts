// Configuration utilities for Cashfree integration
// Using frontend JS SDK and direct API calls for backend

interface CashfreeConfig {
  appId: string;
  secretKey: string;
  environment: 'SANDBOX' | 'PRODUCTION';
}

let cashfreeConfig: CashfreeConfig | null = null;
let cashfreeJS: unknown = null;

// Frontend Cashfree JS SDK initialization (for checkout)
export const initializeCashfreeJS = async (mode: 'sandbox' | 'production' = 'sandbox') => {
  try {
    if (typeof window === 'undefined') {
      // Server-side, return null
      return null;
    }

    const { load } = await import('@cashfreepayments/cashfree-js');
    cashfreeJS = await load({ mode });
    return cashfreeJS;
  } catch (error) {
    console.error('Failed to initialize Cashfree JS SDK:', error);
    throw new Error('Cashfree JS SDK initialization failed');
  }
};

// Get initialized Cashfree JS instance
export const getCashfreeJS = () => cashfreeJS;

// Backend configuration (for API calls)
export const initializeCashfreeBackend = (appId: string, secretKey: string, environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX') => {
  cashfreeConfig = { appId, secretKey, environment };
  return cashfreeConfig;
};

// Validate Cashfree configuration
export const validateCashfreeConfig = (appId?: string, secretKey?: string): boolean => {
  return !!(appId && secretKey && appId.trim() && secretKey.trim());
};

// Get stored Cashfree configuration
export const getCashfreeConfig = () => cashfreeConfig;

// Set Cashfree configuration for later use
export const setCashfreeConfig = (appId: string, secretKey: string, environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX') => {
  cashfreeConfig = { appId, secretKey, environment };
};

// Get base URL for Cashfree API based on environment
export const getCashfreeBaseUrl = (environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX'): string => {
  return environment === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';
};

// Create headers for Cashfree API requests
export const createCashfreeHeaders = (appId: string, secretKey: string) => {
  return {
    'x-api-version': '2025-01-01',
    'x-client-id': appId,
    'x-client-secret': secretKey,
    'Content-Type': 'application/json',
  };
};

// Initialize Cashfree configuration
export const initializeCashfree = (appId: string, secretKey: string, environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX') => {
  setCashfreeConfig(appId, secretKey, environment);
  return { appId, secretKey, environment };
};

// Get Cashfree configuration - for API usage
export const getCashfreeInstance = (appId?: string, secretKey?: string, environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX') => {
  if (!cashfreeConfig && (!appId || !secretKey)) {
    throw new Error('Cashfree not initialized. Call initializeCashfree first or provide credentials.');
  }
  
  const config = cashfreeConfig || { appId: appId!, secretKey: secretKey!, environment };
  return config;
};