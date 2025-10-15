import { prisma } from './prisma';
import { ActivityType } from '@prisma/client';

interface ActivityLogData {
  userId: string;
  action: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export async function logActivity(data: ActivityLogData) {
  try {
    await prisma.userActivity.create({
      data: {
        userId: data.userId,
        action: data.action,
        description: data.description,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to prevent breaking user flow
  }
}

// Helper functions for common activities
export async function logLogin(userId: string, ipAddress?: string, userAgent?: string) {
  await logActivity({
    userId,
    action: 'LOGIN',
    description: 'User logged in to the platform',
    metadata: { timestamp: new Date().toISOString() },
    ipAddress,
    userAgent
  });
}

export async function logLogout(userId: string, ipAddress?: string, userAgent?: string) {
  await logActivity({
    userId,
    action: 'LOGOUT',
    description: 'User logged out from the platform',
    metadata: { timestamp: new Date().toISOString() },
    ipAddress,
    userAgent
  });
}

export async function logTopicStarted(
  userId: string, 
  topicId: string, 
  topicName: string,
  ipAddress?: string, 
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'TOPIC_STARTED',
    description: `Started learning topic: ${topicName}`,
    metadata: { 
      topicId, 
      topicName,
      startedAt: new Date().toISOString() 
    },
    ipAddress,
    userAgent
  });
}

export async function logTopicCompleted(
  userId: string, 
  topicId: string, 
  topicName: string,
  timeSpent?: number,
  ipAddress?: string, 
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'TOPIC_COMPLETED',
    description: `Completed topic: ${topicName}`,
    metadata: { 
      topicId, 
      topicName, 
      timeSpent,
      completedAt: new Date().toISOString() 
    },
    ipAddress,
    userAgent
  });
}

export async function logSubscriptionCreated(
  userId: string,
  subscriptionId: string,
  planType: string,
  amount: number,
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'SUBSCRIPTION_CREATED',
    description: `Created ${planType} subscription`,
    metadata: {
      subscriptionId,
      planType,
      amount,
      currency: 'INR',
      createdAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

export async function logSubscriptionCancelled(
  userId: string,
  subscriptionId: string,
  planType: string,
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'SUBSCRIPTION_CANCELLED',
    description: `Cancelled ${planType} subscription`,
    metadata: {
      subscriptionId,
      planType,
      cancelledAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

export async function logPaymentInitiated(
  userId: string,
  paymentId: string,
  amount: number,
  gateway: string,
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'PAYMENT_INITIATED',
    description: `Initiated payment of ₹${amount/100} via ${gateway}`,
    metadata: {
      paymentId,
      amount,
      gateway,
      currency: 'INR',
      initiatedAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

export async function logPaymentCompleted(
  userId: string,
  paymentId: string,
  amount: number,
  gateway: string,
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'PAYMENT_COMPLETED',
    description: `Completed payment of ₹${amount/100} via ${gateway}`,
    metadata: {
      paymentId,
      amount,
      gateway,
      currency: 'INR',
      completedAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

export async function logPaymentFailed(
  userId: string,
  paymentId: string,
  amount: number,
  gateway: string,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'PAYMENT_FAILED',
    description: `Payment failed for ₹${amount/100} via ${gateway}${reason ? `: ${reason}` : ''}`,
    metadata: {
      paymentId,
      amount,
      gateway,
      currency: 'INR',
      failureReason: reason,
      failedAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

export async function logProfileUpdated(
  userId: string,
  updatedFields: string[],
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'PROFILE_UPDATED',
    description: `Updated profile fields: ${updatedFields.join(', ')}`,
    metadata: {
      updatedFields,
      updatedAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

export async function logClassAccessed(
  userId: string,
  classId: number,
  className: string,
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'CLASS_ACCESSED',
    description: `Accessed class: ${className}`,
    metadata: {
      classId,
      className,
      accessedAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

export async function logSubjectAccessed(
  userId: string,
  subjectId: string,
  subjectName: string,
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'SUBJECT_ACCESSED',
    description: `Accessed subject: ${subjectName}`,
    metadata: {
      subjectId,
      subjectName,
      accessedAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

export async function logDashboardAccess(
  userId: string,
  ipAddress?: string,
  userAgent?: string
) {
  await logActivity({
    userId,
    action: 'CLASS_ACCESSED',
    description: 'Accessed dashboard',
    metadata: {
      accessedAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}