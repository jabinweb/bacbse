import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearSmtpCache } from '@/lib/mail';
import { clearRazorpayCache } from '@/lib/razorpay-global';

export async function GET() {
  try {
    // Try to fetch settings with a simpler query first
    const settings = await prisma.adminSettings.findMany({
      select: {
        key: true,
        value: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transform to key-value object
    const settingsObj = (settings || []).reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {
      // Default values as fallback
      siteName: 'ScioLabs',
      siteDescription: 'Interactive Learning Platform',
      siteUrl: process.env.NEXTAUTH_URL || 'https://sprints.sciolabs.in',
      contactEmail: 'contact@sciolabs.in',
      supportEmail: 'support@sciolabs.in',
      subscriptionPrice: '299',
      emailNotifications: 'true',
      maintenanceMode: 'false',
      
      // Payment Gateway Selection
      payment_default_gateway: 'RAZORPAY',
      
      // Razorpay Settings
      payment_razorpay_enabled: 'true',
      paymentMode: 'test',
      razorpayKeyId: '',
      razorpayTestKeyId: '',
      razorpayKeySecret: '',
      razorpayTestKeySecret: '',
      
      // Cashfree Settings
      payment_cashfree_enabled: 'false',
      payment_cashfree_app_id: '',
      payment_cashfree_secret_key: '',
      payment_cashfree_test_app_id: '',
      payment_cashfree_test_secret_key: '',
      payment_cashfree_environment: 'SANDBOX',
      
      // SMTP Settings
      smtpHost: 'smtp.hostinger.com',
      smtpPort: '587',
      smtpUser: 'info@sciolabs.in',
      smtpPass: '',
      smtpFrom: 'info@sciolabs.in',
      smtpFromName: 'ScioLabs Team'
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Unexpected error fetching settings:', error);
    
    // Return default settings on any error
    return NextResponse.json({
      siteName: 'ScioLabs',
      siteDescription: 'Interactive Learning Platform',
      siteUrl: process.env.NEXTAUTH_URL || 'https://sprints.sciolabs.in',
      contactEmail: 'contact@sciolabs.in',
      supportEmail: 'support@sciolabs.in',
      subscriptionPrice: '299',
      emailNotifications: 'true',
      maintenanceMode: 'false',
      paymentMode: 'test',
      razorpayKeyId: '',
      razorpayTestKeyId: '',
      razorpayKeySecret: '',
      razorpayTestKeySecret: '',
      smtpHost: 'smtp.hostinger.com',
      smtpPort: '587',
      smtpUser: 'info@sciolabs.in',
      smtpPass: '',
      smtpFrom: 'info@sciolabs.in',
      smtpFromName: 'ScioLabs Team'
    });
  }
}

export async function PUT(request: Request) {
  const startTime = Date.now();
  
  try {
    const updates = await request.json();
    
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    console.log(`[info] Starting settings update for ${Object.keys(updates).length} settings`);
    
    // Use a transaction to batch all operations for better performance
    await prisma.$transaction(async (tx) => {
      // Use Promise.all to execute all upsert operations in parallel
      const upsertPromises = Object.entries(updates).map(([key, value]) => {
        return tx.adminSettings.upsert({
          where: { key },
          update: {
            value: String(value),
            updatedAt: new Date()
          },
          create: {
            key,
            value: String(value),
            description: `Setting for ${key}`,
            category: getSettingCategory(key),
            dataType: 'string',
            isPublic: false
          }
        });
      });
      
      await Promise.all(upsertPromises);
    }, {
      timeout: 8000 // Set timeout to 8 seconds to stay under Vercel's 10s limit
    });

    // Clear appropriate caches based on what was updated
    const updatedKeys = Object.keys(updates);
    const hasSmtpUpdate = updatedKeys.some(key => key.includes('smtp') || key.includes('email') || key.includes('mail'));
    const hasPaymentUpdate = updatedKeys.some(key => key.includes('razorpay') || key.includes('payment') || key.includes('cashfree'));
    
    if (hasSmtpUpdate) {
      clearSmtpCache();
    }
    
    if (hasPaymentUpdate) {
      clearRazorpayCache();
      // Note: Add clearCashfreeCache() here when implemented
    }

    const duration = Date.now() - startTime;
    console.log(`[info] Settings update completed successfully in ${duration}ms`);
    
    return NextResponse.json({ 
      success: true, 
      updated: Object.keys(updates).length,
      duration: `${duration}ms`
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[error] Error updating settings after ${duration}ms:`, error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Settings update timed out. Please try saving fewer settings at once.' 
        }, { status: 408 });
      }
      
      if (error.message.includes('constraint')) {
        return NextResponse.json({ 
          error: 'Database constraint violation. Please check your input values.' 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to update settings. Please try again.' 
    }, { status: 500 });
  }
}

// Helper function to categorize settings
function getSettingCategory(key: string): string {
  if (key.includes('razorpay') || key.includes('payment')) return 'payment';
  if (key.includes('smtp') || key.includes('email') || key.includes('mail')) return 'email';
  if (key.includes('site') || key.includes('contact') || key.includes('support') || key.includes('description')) return 'general';
  if (key.includes('maintenance')) return 'system';
  return 'general';
}
