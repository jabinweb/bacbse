import { prisma } from '@/lib/prisma';

interface ErrorLogEntry {
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
  details?: Record<string, unknown>;
  userId?: string;
  paymentId?: string;
  timestamp: Date;
  stack?: string;
}

// Enhanced logging utility for payment and subscription flows
export class PaymentLogger {
  private static async logToDatabase(entry: ErrorLogEntry) {
    try {
      await prisma.errorLog.create({
        data: {
          level: entry.level,
          source: entry.source,
          message: entry.message,
          details: entry.details ? JSON.stringify(entry.details) : null,
          userId: entry.userId,
          paymentId: entry.paymentId,
          timestamp: entry.timestamp,
          stack: entry.stack
        }
      });
    } catch (dbError) {
      // Fallback to console if database logging fails
      console.error('[PaymentLogger] Database logging failed:', dbError);
      console.error('[PaymentLogger] Original log entry:', entry);
    }
  }

  static info(source: string, message: string, details?: Record<string, unknown>, userId?: string, paymentId?: string) {
    const entry: ErrorLogEntry = {
      level: 'INFO',
      source,
      message,
      details,
      userId,
      paymentId,
      timestamp: new Date()
    };
    
    console.log(`[${source}] ${message}`, details || '');
    this.logToDatabase(entry).catch(() => {}); // Don't await to avoid blocking
  }

  static warn(source: string, message: string, details?: Record<string, unknown>, userId?: string, paymentId?: string) {
    const entry: ErrorLogEntry = {
      level: 'WARN',
      source,
      message,
      details,
      userId,
      paymentId,
      timestamp: new Date()
    };
    
    console.warn(`[${source}] ${message}`, details || '');
    this.logToDatabase(entry).catch(() => {}); // Don't await to avoid blocking
  }

  static error(source: string, message: string, error?: Error, details?: Record<string, unknown>, userId?: string, paymentId?: string) {
    const entry: ErrorLogEntry = {
      level: 'ERROR',
      source,
      message,
      details: {
        ...details,
        errorMessage: error?.message,
        errorName: error?.name
      },
      userId,
      paymentId,
      timestamp: new Date(),
      stack: error?.stack
    };
    
    console.error(`[${source}] ${message}`, error || '', details || '');
    this.logToDatabase(entry).catch(() => {}); // Don't await to avoid blocking
  }

  static critical(source: string, message: string, error?: Error, details?: Record<string, unknown>, userId?: string, paymentId?: string) {
    const entry: ErrorLogEntry = {
      level: 'CRITICAL',
      source,
      message,
      details: {
        ...details,
        errorMessage: error?.message,
        errorName: error?.name
      },
      userId,
      paymentId,
      timestamp: new Date(),
      stack: error?.stack
    };
    
    console.error(`[CRITICAL][${source}] ${message}`, error || '', details || '');
    this.logToDatabase(entry).catch(() => {}); // Don't await to avoid blocking
    
    // For critical errors, also try to send immediate notification to admin
    this.sendCriticalAlert(entry).catch(() => {});
  }

  private static async sendCriticalAlert(entry: ErrorLogEntry) {
    try {
      // Check if we have admin notification setup
      const adminSettings = await prisma.adminSettings.findFirst({
        where: { key: 'admin_notification_email' }
      });

      if (adminSettings?.value) {
        const { sendEmail } = await import('@/lib/mail');
        
        await sendEmail({
          to: adminSettings.value,
          subject: `[CRITICAL] Payment System Error - ${entry.source}`,
          html: `
            <h2>Critical Payment System Error</h2>
            <p><strong>Source:</strong> ${entry.source}</p>
            <p><strong>Message:</strong> ${entry.message}</p>
            <p><strong>Time:</strong> ${entry.timestamp.toISOString()}</p>
            ${entry.userId ? `<p><strong>User ID:</strong> ${entry.userId}</p>` : ''}
            ${entry.paymentId ? `<p><strong>Payment ID:</strong> ${entry.paymentId}</p>` : ''}
            ${entry.details ? `<p><strong>Details:</strong> <pre>${JSON.stringify(entry.details, null, 2)}</pre></p>` : ''}
            ${entry.stack ? `<p><strong>Stack Trace:</strong> <pre>${entry.stack}</pre></p>` : ''}
          `,
          text: `
            Critical Payment System Error
            
            Source: ${entry.source}
            Message: ${entry.message}
            Time: ${entry.timestamp.toISOString()}
            ${entry.userId ? `User ID: ${entry.userId}` : ''}
            ${entry.paymentId ? `Payment ID: ${entry.paymentId}` : ''}
            ${entry.details ? `Details: ${JSON.stringify(entry.details, null, 2)}` : ''}
            ${entry.stack ? `Stack Trace: ${entry.stack}` : ''}
          `
        });
      }
    } catch (alertError) {
      console.error('[PaymentLogger] Failed to send critical alert:', alertError);
    }
  }

  // Get recent error logs for debugging
  static async getRecentLogs(source?: string, level?: string, limit = 50) {
    try {
      return await prisma.errorLog.findMany({
        where: {
          ...(source && { source }),
          ...(level && { level })
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('[PaymentLogger] Failed to retrieve logs:', error);
      return [];
    }
  }

  // Clean up old logs (should be run periodically)
  static async cleanup(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deleted = await prisma.errorLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          },
          level: {
            notIn: ['CRITICAL'] // Keep critical logs longer
          }
        }
      });

      console.log(`[PaymentLogger] Cleaned up ${deleted.count} old log entries`);
      return deleted.count;
    } catch (error) {
      console.error('[PaymentLogger] Failed to cleanup logs:', error);
      return 0;
    }
  }
}

// Payment health check utility
export class PaymentHealthCheck {
  static async checkSystemHealth() {
    const health = {
      timestamp: new Date(),
      database: false,
      paymentGateways: {
        razorpay: false,
        cashfree: false
      },
      recentErrors: 0,
      failureRate: 0
    };

    try {
      // Check database connectivity
      await prisma.$queryRaw`SELECT 1`;
      health.database = true;
    } catch (error) {
      PaymentLogger.error('HealthCheck', 'Database connectivity failed', error instanceof Error ? error : new Error('Unknown database error'));
    }

    try {
      // Check payment gateway configurations
      const { getPaymentConfig } = await import('@/lib/payment-service');
      const config = await getPaymentConfig();

      health.paymentGateways.razorpay = config.razorpay.enabled && !!config.razorpay.keyId && !!config.razorpay.keySecret;
      health.paymentGateways.cashfree = config.cashfree.enabled && !!config.cashfree.appId && !!config.cashfree.secretKey;
    } catch (error) {
      PaymentLogger.error('HealthCheck', 'Payment gateway config check failed', error instanceof Error ? error : new Error('Unknown config error'));
    }

    try {
      // Check recent error rate (last 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentErrors = await prisma.errorLog.count({
        where: {
          timestamp: { gte: oneHourAgo },
          level: { in: ['ERROR', 'CRITICAL'] },
          source: { contains: 'Payment' }
        }
      });

      const totalPayments = await prisma.payment.count({
        where: {
          created_at: { gte: oneHourAgo }
        }
      });

      health.recentErrors = recentErrors;
      health.failureRate = totalPayments > 0 ? (recentErrors / totalPayments) * 100 : 0;
    } catch (error) {
      PaymentLogger.error('HealthCheck', 'Error rate calculation failed', error instanceof Error ? error : new Error('Unknown error rate error'));
    }

    return health;
  }
}