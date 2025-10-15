/**
 * Admin Notification Utilities
 * 
 * This module provides utility functions to send admin notifications
 * for critical system events that require administrative attention.
 */

import { sendEmail } from './mail';
import { generateEmailContent } from './email';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@sciolabs.in';

export interface AdminNotificationData {
  userName?: string;
  userEmail?: string;
  subscriptionName?: string;
  amount?: number;
  paymentId?: string;
  failureReason?: string;
  errorType?: string;
  errorMessage?: string;
  location?: string;
  [key: string]: unknown;
}

/**
 * Send admin notification for new subscription
 */
export async function notifyAdminNewSubscription(data: AdminNotificationData): Promise<void> {
  try {
    const emailContent = generateEmailContent('admin_new_subscription', data);
    
    console.log('Sending admin notification to:', ADMIN_EMAIL);
    console.log('Email subject:', emailContent.subject);
    
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
    
    console.log('Admin notification sent: New subscription created');
  } catch (error) {
    console.error('Failed to send admin new subscription notification:', error);
    // Don't throw - admin notifications shouldn't break user flows
  }
}

/**
 * Send admin notification for payment failure
 */
export async function notifyAdminPaymentFailed(data: AdminNotificationData): Promise<void> {
  try {
    const emailContent = generateEmailContent('admin_payment_failed', data);
    
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
    
    console.log('Admin notification sent: Payment failed');
  } catch (error) {
    console.error('Failed to send admin payment failure notification:', error);
    // Don't throw - admin notifications shouldn't break user flows
  }
}

/**
 * Send admin notification for system errors
 */
export async function notifyAdminSystemError(data: AdminNotificationData): Promise<void> {
  try {
    const emailContent = generateEmailContent('admin_system_error', data);
    
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
    
    console.log('Admin notification sent: System error detected');
  } catch (error) {
    console.error('Failed to send admin system error notification:', error);
    // Don't throw - admin notifications shouldn't break user flows
  }
}

/**
 * Send admin notification for bulk upload results
 */
export async function notifyAdminBulkUploadResult(
  success: boolean, 
  total: number, 
  processed: number, 
  errors: Array<{row: number; error: string}>
): Promise<void> {
  try {
    const subject = success 
      ? `✅ Bulk Upload Completed - ${processed}/${total} processed`
      : `⚠️ Bulk Upload Issues - ${errors.length} errors`;
    
    const errorSummary = errors.length > 0 
      ? `\n\nErrors:\n${errors.slice(0, 5).map(e => `Row ${e.row}: ${e.error}`).join('\n')}`
      : '';
    
    await sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html: `
        <h2>${success ? 'Bulk Upload Completed Successfully' : 'Bulk Upload Completed with Issues'}</h2>
        <p><strong>Total Records:</strong> ${total}</p>
        <p><strong>Processed:</strong> ${processed}</p>
        <p><strong>Errors:</strong> ${errors.length}</p>
        ${errors.length > 0 ? `<p><strong>Sample Errors:</strong></p><ul>${errors.slice(0, 5).map(e => `<li>Row ${e.row}: ${e.error}</li>`).join('')}</ul>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/students">View Students in Admin Panel</a></p>
      `,
      text: `Bulk Upload Summary\n\nTotal: ${total}\nProcessed: ${processed}\nErrors: ${errors.length}${errorSummary}`
    });
    
    console.log('Admin notification sent: Bulk upload result');
  } catch (error) {
    console.error('Failed to send admin bulk upload notification:', error);
    // Don't throw - admin notifications shouldn't break user flows
  }
}