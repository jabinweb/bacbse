import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

// Cache for Razorpay settings to avoid repeated DB queries
interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  paymentMode: 'test' | 'live';
  isTestMode: boolean;
}

let razorpaySettingsCache: RazorpayConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to clear the cache (used when settings are updated)
export function clearRazorpayCache() {
  razorpaySettingsCache = null;
  cacheTimestamp = 0;
  console.log('Razorpay settings cache cleared');
}

// Function to get Razorpay settings from database with fallback to env variables
export async function getRazorpayConfig(): Promise<RazorpayConfig> {
  // Check if cache is still valid
  if (razorpaySettingsCache && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return razorpaySettingsCache;
  }

  try {
    // Fetch Razorpay settings from database
    const dbSettings = await prisma.adminSettings.findMany({
      where: {
        key: {
          in: ['paymentMode', 'razorpayTestKeyId', 'razorpayKeyId', 'razorpayTestKeySecret', 'razorpayKeySecret']
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    // Convert to key-value object
    const settingsObj = dbSettings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Determine payment mode with fallback
    const paymentMode = (settingsObj.paymentMode as 'test' | 'live') || 
                       (process.env.NEXT_PUBLIC_PAYMENT_MODE as 'test' | 'live') || 
                       'test';
    
    const isTestMode = paymentMode === 'test';

    // Get appropriate keys based on mode with fallbacks
    const keyId = isTestMode
      ? (settingsObj.razorpayTestKeyId || process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID || '')
      : (settingsObj.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID || '');

    const keySecret = isTestMode
      ? (settingsObj.razorpayTestKeySecret || process.env.RAZORPAY_TEST_KEY_SECRET || '')
      : (settingsObj.razorpayKeySecret || process.env.RAZORPAY_LIVE_KEY_SECRET || '');

    // Prepare configuration
    const razorpayConfig: RazorpayConfig = {
      keyId,
      keySecret,
      paymentMode,
      isTestMode
    };

    // Cache the settings
    razorpaySettingsCache = razorpayConfig;
    cacheTimestamp = Date.now();
    
    console.log(`Razorpay settings loaded: ${paymentMode} mode from`, 
                dbSettings.length > 0 ? 'database (with env fallbacks)' : 'environment variables');
    
    return razorpayConfig;
  } catch (error) {
    console.error('Error fetching Razorpay settings from database, using env variables:', error);
    
    // Fallback to environment variables only
    const paymentMode = (process.env.NEXT_PUBLIC_PAYMENT_MODE as 'test' | 'live') || 'test';
    const isTestMode = paymentMode === 'test';
    
    const envConfig: RazorpayConfig = {
      keyId: isTestMode 
        ? (process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID || '')
        : (process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID || ''),
      keySecret: isTestMode
        ? (process.env.RAZORPAY_TEST_KEY_SECRET || '')
        : (process.env.RAZORPAY_LIVE_KEY_SECRET || ''),
      paymentMode,
      isTestMode
    };
    
    return envConfig;
  }
}

// Function to create Razorpay instance with dynamic settings
export async function createRazorpayInstance(): Promise<Razorpay | null> {
  try {
    const config = await getRazorpayConfig();
    
    if (!config.keyId || !config.keySecret) {
      console.error(`Razorpay ${config.paymentMode} credentials not configured`);
      return null;
    }

    const instance = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });

    console.log(`Razorpay instance created in ${config.paymentMode} mode`);
    return instance;
  } catch (error) {
    console.error('Error creating Razorpay instance:', error);
    return null;
  }
}

// Function to validate Razorpay configuration
export async function validateRazorpayConfig(): Promise<{ valid: boolean; error?: string; mode?: string }> {
  try {
    const config = await getRazorpayConfig();
    
    if (!config.keyId) {
      return { 
        valid: false, 
        error: `Razorpay ${config.paymentMode} Key ID not configured`,
        mode: config.paymentMode 
      };
    }
    
    if (!config.keySecret) {
      return { 
        valid: false, 
        error: `Razorpay ${config.paymentMode} Key Secret not configured`,
        mode: config.paymentMode 
      };
    }
    
    return { 
      valid: true, 
      mode: config.paymentMode 
    };
  } catch (error) {
    return { 
      valid: false, 
      error: `Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Export the config for backward compatibility (but prefer using functions above)
export async function getRazorpayConfigLegacy() {
  const config = await getRazorpayConfig();
  return {
    keyId: config.keyId,
    keySecret: config.keySecret,
    isTestMode: config.isTestMode
  };
}