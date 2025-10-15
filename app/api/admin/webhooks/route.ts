import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WebhookEvent, WebhookPayload } from '@/lib/webhook-utils';

interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  secret?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { event, subscriptionId, data } = await request.json();

    if (!event || !subscriptionId) {
      return NextResponse.json(
        { error: 'Event and subscription ID are required' },
        { status: 400 }
      );
    }

    // Get subscription details for the webhook
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Prepare webhook payload
    const webhookPayload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        userEmail: subscription.user.email || undefined,
        className: subscription.class?.name,
        subjectName: subscription.subject?.name,
        amount: subscription.amount,
        currency: subscription.currency,
        status: subscription.status,
        startDate: subscription.startDate?.toISOString(),
        endDate: subscription.endDate?.toISOString(),
        ...data // Merge additional data from request
      }
    };

    // Get registered webhook endpoints (in real implementation, this would be from a database)
    const webhookEndpoints = await getWebhookEndpoints(event);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Send webhook to all registered endpoints
    for (const endpoint of webhookEndpoints) {
      try {
        await sendWebhook(endpoint, webhookPayload);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${endpoint.url}: ${error}`);
      }
    }

    console.log(`Webhook sent for ${event}:`, results);

    return NextResponse.json({
      success: true,
      event,
      subscriptionId,
      results
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// GET method to register webhook endpoints (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'register') {
      const url = searchParams.get('url');
      const events = searchParams.get('events')?.split(',') as WebhookEvent[];
      const secret = searchParams.get('secret');

      if (!url || !events) {
        return NextResponse.json(
          { error: 'URL and events are required' },
          { status: 400 }
        );
      }

      // In a real implementation, you would save this to a database
      // For now, we'll just return the registration confirmation
      return NextResponse.json({
        success: true,
        message: 'Webhook endpoint registered',
        endpoint: {
          url,
          events,
          secret: secret ? '***hidden***' : undefined,
          active: true
        }
      });
    }

    // List registered webhooks (mock data for demonstration)
    const mockEndpoints = [
      {
        id: '1',
        url: 'https://your-app.com/webhooks/subscriptions',
        events: ['subscription.created', 'subscription.renewed', 'subscription.expired'],
        active: true
      },
      {
        id: '2',
        url: 'https://analytics.your-app.com/webhooks',
        events: ['payment.successful', 'payment.failed'],
        active: true
      }
    ];

    return NextResponse.json({
      success: true,
      endpoints: mockEndpoints
    });

  } catch (error) {
    console.error('Error in webhook endpoint management:', error);
    return NextResponse.json(
      { error: 'Failed to manage webhook endpoints' },
      { status: 500 }
    );
  }
}

async function getWebhookEndpoints(event: WebhookEvent): Promise<WebhookEndpoint[]> {
  // In a real implementation, this would query a database for webhook endpoints
  // that are subscribed to this specific event
  
  // Mock endpoints for demonstration
  const allEndpoints: WebhookEndpoint[] = [
    {
      id: '1',
      url: 'https://your-app.com/webhooks/subscriptions',
      events: [
        'subscription.created',
        'subscription.renewed',
        'subscription.expired',
        'subscription.cancelled',
        'subscription.grace_period_started'
      ],
      active: true,
      secret: process.env.WEBHOOK_SECRET_1
    },
    {
      id: '2',
      url: 'https://analytics.your-app.com/webhooks',
      events: [
        'payment.successful',
        'payment.failed',
        'auto_renewal.successful',
        'auto_renewal.failed'
      ],
      active: true,
      secret: process.env.WEBHOOK_SECRET_2
    }
  ];

  // Filter endpoints that are interested in this event
  return allEndpoints.filter(endpoint => 
    endpoint.active && endpoint.events.includes(event)
  );
}

async function sendWebhook(endpoint: WebhookEndpoint, payload: WebhookPayload) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Scio-Webhooks/1.0'
  };

  // Add signature if secret is configured
  if (endpoint.secret) {
    const signature = await generateSignature(JSON.stringify(payload), endpoint.secret);
    headers['X-Scio-Signature'] = signature;
  }

  const response = await fetch(endpoint.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  // Generate HMAC signature for webhook verification
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  return `sha256=${hashHex}`;
}