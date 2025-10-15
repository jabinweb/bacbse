// Enhanced payment verification utilities with retry logic and fallback mechanisms
import { prisma } from '@/lib/prisma';
import { getAcademicYearEndDate } from '@/lib/subscription-date-utils';


interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface PaymentVerificationResult {
  success: boolean;
  payment?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
  data?: Record<string, unknown> | Record<string, unknown>[];
  error?: string;
  retryCount?: number;
}

// Default retry configuration
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,  // 1 second
  maxDelay: 8000,   // 8 seconds max
  backoffFactor: 2
};

// Exponential backoff with jitter
function calculateDelay(attempt: number, options: RetryOptions): number {
  const exponentialDelay = Math.min(
    options.baseDelay * Math.pow(options.backoffFactor, attempt),
    options.maxDelay
  );
  
  // Add jitter (random factor) to prevent thundering herd
  const jitter = exponentialDelay * 0.1 * Math.random();
  return Math.floor(exponentialDelay + jitter);
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry wrapper for async operations
async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
  operationName?: string
): Promise<T> {
  let lastError: Error = new Error('Operation failed');
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (attempt > 0) {
        console.log(`[${operationName}] Succeeded on retry attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on certain types of errors
      if (isNonRetriableError(lastError)) {
        console.log(`[${operationName}] Non-retriable error: ${lastError.message}`);
        throw lastError;
      }
      
      if (attempt < options.maxRetries) {
        const delay = calculateDelay(attempt, options);
        console.log(`[${operationName}] Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  console.error(`[${operationName}] All retry attempts failed. Last error: ${lastError.message}`);
  throw lastError;
}

// Check if error should not be retried
function isNonRetriableError(error: Error): boolean {
  const nonRetriablePatterns = [
    'Invalid payment signature',
    'Payment record not found',
    'Invalid payment verification request',
    'Payment ID is required',
    'User not found',
    'Class not found',
    'Subject not found'
  ];
  
  return nonRetriablePatterns.some(pattern => 
    error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}

// Enhanced payment verification with retry logic
export async function verifyPaymentWithRetry(
  verificationData: {
    paymentId?: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    orderId?: string;
  },
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<PaymentVerificationResult> {
  try {
    const result = await withRetry(async () => {
      // Dynamic import to avoid circular dependencies
      const { verifyRazorpayPayment, verifyCashfreePayment } = await import('@/lib/payment-service');
      
      const { paymentId, razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = verificationData;
      
      // Handle Razorpay payment verification
      if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
        return await verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      }
      
      // Handle Cashfree payment verification
      if (orderId || paymentId) {
        const cashfreePaymentId = paymentId || '';
        const cashfreeOrderId = orderId || paymentId || '';
        return await verifyCashfreePayment(cashfreePaymentId, cashfreeOrderId);
      }
      
      throw new Error('Invalid payment verification request. Missing required parameters.');
    }, options, 'PaymentVerification');

    return {
      success: true,
      payment: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown verification error'
    };
  }
}

// Create subscription with retry logic
export async function createSubscriptionWithRetry(
  subscriptionData: {
    metadata: {
      userId: string;
      type: string;
      classId?: number;
      subjectId?: string;
      subjectIds?: string[];
    };
    payment: {
      id: string;
      amount: number;
      currency: string;
    };
  },
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<PaymentVerificationResult> {
  try {
    const result = await withRetry(async () => {
      const { metadata, payment } = subscriptionData;
      
      if (metadata.type === 'class_subscription') {
        // Check for existing subscription
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            userId: metadata.userId,
            classId: metadata.classId,
            subjectId: null,
            status: 'ACTIVE',
            endDate: { gte: new Date() }
          }
        });

        if (existingSubscription) {
          console.log('Subscription already exists, skipping creation');
          return existingSubscription;
        }

        // Create new subscription
        const endDate = getAcademicYearEndDate(); // Academic year ends March 31st
        const subscription = await prisma.subscription.create({
          data: {
            userId: metadata.userId,
            classId: metadata.classId,
            subjectId: null,
            status: 'ACTIVE',
            planType: 'class_subscription',
            amount: payment.amount,
            currency: payment.currency || 'INR',
            startDate: new Date(),
            endDate: endDate
          }
        });

        return subscription;
      } else if (metadata.type === 'subject_subscription') {
        const subjectIds: string[] = metadata.subjectIds || (metadata.subjectId ? [metadata.subjectId] : []);
        
        if (subjectIds.length === 0) {
          throw new Error('No subject IDs provided for subject subscription');
        }

        // Check for existing subscriptions
        const existingSubscriptions = await prisma.subscription.findMany({
          where: {
            userId: metadata.userId,
            subjectId: { in: subjectIds },
            status: 'ACTIVE',
            endDate: { gte: new Date() }
          }
        });

        const existingSubjectIds = existingSubscriptions.map(s => s.subjectId).filter((id): id is string => id !== null);
        const newSubjectIds = subjectIds.filter((id: string) => !existingSubjectIds.includes(id));

        if (newSubjectIds.length === 0) {
          console.log('All subject subscriptions already exist, skipping creation');
          return existingSubscriptions;
        }

        // Create subscriptions for new subjects
        const endDate = getAcademicYearEndDate(); // Academic year ends March 31st
        const subscriptionData = newSubjectIds.map((subjectId: string) => ({
          userId: metadata.userId,
          subjectId: subjectId,
          status: 'ACTIVE' as const,
          planType: 'subject_subscription' as const,
          amount: Math.floor((payment.amount || 0) / subjectIds.length),
          currency: payment.currency || 'INR',
          startDate: new Date(),
          endDate: endDate
        }));

        await prisma.subscription.createMany({
          data: subscriptionData
        });

        return subscriptionData;
      }

      throw new Error('Invalid subscription type');
    }, options, 'SubscriptionCreation');

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown subscription creation error'
    };
  }
}

// Send notification emails with retry logic
export async function sendNotificationEmailsWithRetry(
  emailData: {
    user?: {
      email?: string;
      displayName?: string;
    };
    subscriptionDetails: Record<string, unknown>;
    payment: {
      amount?: number;
    } & Record<string, unknown>;
    paymentData: Record<string, unknown>;
  },
  options: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, maxRetries: 2 } // Fewer retries for emails
): Promise<void> {
  try {
    await withRetry(async () => {
      const { sendEmail } = await import('@/lib/mail');
      const { generateEmailContent } = await import('@/lib/email');
      const { notifyAdminNewSubscription } = await import('@/lib/admin-notifications');

      const { user, subscriptionDetails, payment, paymentData } = emailData;

      if (user?.email) {
        // Send welcome email
        const welcomeEmailContent = generateEmailContent('new_subscription', {
          userName: user.displayName || user.email.split('@')[0],
          ...subscriptionDetails,
          amount: payment.amount || 0
        });

        await sendEmail({
          to: user.email,
          subject: welcomeEmailContent.subject,
          html: welcomeEmailContent.html,
          text: welcomeEmailContent.text
        });

        // Send receipt email
        const receiptEmailContent = generateEmailContent('payment_receipt', {
          userName: user.displayName || user.email.split('@')[0],
          paymentId: paymentData.paymentId || '',
          orderId: paymentData.orderId || '',
          subscriptionName: subscriptionDetails.subscriptionName || '',
          amount: payment.amount || 0,
          paymentDate: new Date().toISOString()
        });

        await sendEmail({
          to: user.email,
          subject: receiptEmailContent.subject,
          html: receiptEmailContent.html,
          text: receiptEmailContent.text
        });

        // Send admin notification
        await notifyAdminNewSubscription({
          userName: user.displayName || user.email.split('@')[0],
          userEmail: user.email,
          subscriptionName: (subscriptionDetails.subscriptionName as string) || '',
          amount: payment.amount || 0
        });
      }
    }, options, 'EmailNotifications');
  } catch (error) {
    // Log email errors but don't fail the payment verification
    console.error('Failed to send notification emails after retries:', error);
  }
}

// Circuit breaker pattern for external API calls
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold = 5,
    private timeout = 60000, // 1 minute
    private resetTimeout = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

export const paymentCircuitBreaker = new CircuitBreaker();