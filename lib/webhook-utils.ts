// Webhook events that can be triggered
export type WebhookEvent = 
  | 'subscription.created'
  | 'subscription.renewed' 
  | 'subscription.expired'
  | 'subscription.cancelled'
  | 'subscription.grace_period_started'
  | 'payment.successful'
  | 'payment.failed'
  | 'auto_renewal.successful'
  | 'auto_renewal.failed';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: {
    subscriptionId: string;
    userId: string;
    userEmail?: string;
    className?: string;
    subjectName?: string;
    amount?: number;
    currency?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    paymentId?: string;
    reason?: string;
    nextBillingDate?: string;
    gracePeriodEndDate?: string;
  };
}

// Helper function to trigger webhooks from other parts of the application
export async function triggerWebhook(
  event: WebhookEvent, 
  subscriptionId: string, 
  additionalData?: Partial<WebhookPayload['data']>
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        subscriptionId,
        data: additionalData || {}
      })
    });

    if (!response.ok) {
      console.error('Failed to trigger webhook:', await response.text());
    }
  } catch (error) {
    console.error('Error triggering webhook:', error);
  }
}