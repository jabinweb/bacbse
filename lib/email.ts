// Email template functions for subscription management

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourapp.com';

export function generateExpiryWarningEmail(userName: string, className: string, daysLeft: number, endDate: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Expiry Warning</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ Subscription Expiry Warning</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                    <strong>Your subscription to ${className} will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>
                </p>
                <p style="margin: 10px 0 0 0; color: #856404;">
                    Expiry Date: ${new Date(endDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                </p>
            </div>
            
            <p>Don't let your learning journey come to a halt! Renew your subscription to continue accessing:</p>
            
            <ul style="color: #555;">
                <li>Interactive learning content</li>
                <li>Practice exercises and quizzes</li>
                <li>Progress tracking</li>
                <li>Expert support</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard/subscriptions" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Renew Subscription Now
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Questions? Reply to this email or contact our support team.
            </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
            <p>You received this email because you have an active subscription with us.</p>
        </div>
    </body>
    </html>
  `;
}

// DISABLED: Not present in emails.txt
// export function generateGracePeriodEmail(userName: string, className: string, endDate: string) {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Grace Period Notice</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: linear-gradient(135deg, #ff7b7b 0%, #667eea 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
//             <h1 style="margin: 0; font-size: 24px;">🔔 Grace Period Active</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
//             <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
//             <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                 <p style="margin: 0; color: #721c24;">
//                     <strong>Your ${className} subscription has expired but you're in a 7-day grace period.</strong>
//                 </p>
//                 <p style="margin: 10px 0 0 0; color: #721c24;">
//                     Original Expiry: ${new Date(endDate).toLocaleDateString()}
//                 </p>
//             </div>
            
//             <p>You still have limited access, but to restore full functionality and continue your learning:</p>
            
//             <div style="text-align: center; margin: 30px 0;">
//                 <a href="${SITE_URL}/dashboard/subscriptions" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                     Renew Now - Don't Lose Access!
//                 </a>
//             </div>
            
//             <p style="color: #666; font-size: 14px; text-align: center;">
//                 After the grace period, you'll lose access to all premium content.
//             </p>
//         </div>
        
//         <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
//             <p>© 2025 Scio Labs. All rights reserved.</p>
//         </div>
//     </body>
//     </html>
//   `;
// }

// DISABLED: Not present in emails.txt
// export function generateExpiredEmail(userName: string, className: string) {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Subscription Expired</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
//             <h1 style="margin: 0; font-size: 24px;">😔 Subscription Expired</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
//             <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
//             <p>Your subscription to <strong>${className}</strong> has expired, and you no longer have access to premium content.</p>
            
//             <p>We miss you! Resubscribe to continue your learning journey and unlock:</p>
            
//             <ul style="color: #555;">
//                 <li>Full access to all content</li>
//                 <li>New updates and features</li>
//                 <li>Continuous learning progress</li>
//                 <li>Community support</li>
//             </ul>
            
//             <div style="text-align: center; margin: 30px 0;">
//                 <a href="${SITE_URL}/dashboard/subscriptions" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                     Resubscribe Now
//                 </a>
//             </div>
            
//             <p style="color: #666; font-size: 14px; text-align: center;">
//                 We'd love to have you back! Contact us if you have any questions.
//             </p>
//         </div>
        
//         <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
//             <p>© 2025 Scio Labs. All rights reserved.</p>
//         </div>
//     </body>
//     </html>
//   `;
// }

// DISABLED: Not present in emails.txt
// export function generateRenewalReminderEmail(userName: string, className: string) {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Renewal Reminder</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
//             <h1 style="margin: 0; font-size: 24px;">🔄 Time to Renew</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
//             <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
//             <p>It's time to renew your subscription to <strong>${className}</strong> and continue your amazing learning progress!</p>
            
//             <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                 <p style="margin: 0; color: #0c5460;">
//                     <strong>💡 Why renew?</strong> Keep your momentum going and unlock new content that's been added since your last subscription.
//                 </p>
//             </div>
            
//             <div style="text-align: center; margin: 30px 0;">
//                 <a href="${SITE_URL}/dashboard/subscriptions" style="background: #17a2b8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                     Renew Subscription
//                 </a>
//             </div>
//         </div>
        
//         <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
//             <p>© 2025 Scio Labs. All rights reserved.</p>
//         </div>
//     </body>
//     </html>
//   `;
// }

// DISABLED: Not present in emails.txt
// export function generateSubscriptionRenewedEmail(userName: string, className: string, newEndDate: string, amount: number) {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Subscription Renewed</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
//             <h1 style="margin: 0; font-size: 24px;">✅ Subscription Renewed!</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
//             <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
//             <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                 <p style="margin: 0; color: #155724;">
//                     <strong>Great news! Your subscription to ${className} has been renewed successfully.</strong>
//                 </p>
//             </div>
            
//             <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6;">
//                 <h3 style="margin-top: 0; color: #333;">Renewal Details:</h3>
//                 <ul style="list-style: none; padding: 0;">
//                     <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Subscription:</strong> ${className}</li>
//                     <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Charged:</strong> ₹${(amount/100).toFixed(2)}</li>
//                     <li style="padding: 8px 0;"><strong>New Expiry Date:</strong> ${new Date(newEndDate).toLocaleDateString('en-US', { 
//                       weekday: 'long', 
//                       year: 'numeric', 
//                       month: 'long', 
//                       day: 'numeric' 
//                     })}</li>
//                 </ul>
//             </div>
            
//             <p>Continue your learning journey with uninterrupted access to all premium content!</p>
            
//             <div style="text-align: center; margin: 30px 0;">
//                 <a href="${SITE_URL}/dashboard" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                     Continue Learning
//                 </a>
//             </div>
//         </div>
        
//         <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
//             <p>© 2025 Scio Labs. All rights reserved.</p>
//         </div>
//     </body>
//     </html>
//   `;
// }

// DISABLED: Not present in emails.txt
// export function generateAutoRenewalFailedEmail(userName: string, className: string) {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Auto-Renewal Failed</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
//             <h1 style="margin: 0; font-size: 24px;">❌ Auto-Renewal Failed</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
//             <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
//             <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                 <p style="margin: 0; color: #721c24;">
//                     <strong>We were unable to automatically renew your subscription to ${className}.</strong>
//                 </p>
//             </div>
            
//             <p>This could be due to:</p>
//             <ul style="color: #555;">
//                 <li>Expired or invalid payment method</li>
//                 <li>Insufficient funds</li>
//                 <li>Bank security restrictions</li>
//                 <li>Card issuer declined the transaction</li>
//             </ul>
            
//             <p><strong>Don't worry!</strong> You can easily renew your subscription manually:</p>
            
//             <div style="text-align: center; margin: 30px 0;">
//                 <a href="${SITE_URL}/dashboard/subscriptions" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                     Renew Subscription Now
//                 </a>
//             </div>
            
//             <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                 <p style="margin: 0; color: #856404;">
//                     <strong>💡 Tip:</strong> Update your payment method in settings to avoid future issues with auto-renewal.
//                 </p>
//             </div>
            
//             <p style="color: #666; font-size: 14px; text-align: center;">
//                 Need help? Contact our support team and we'll assist you right away.
//             </p>
//         </div>
        
//         <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
//             <p>© 2025 Scio Labs. All rights reserved.</p>
//         </div>
//     </body>
//     </html>
//   `;
// }

export function generateWelcomeEmail(userName: string, subscriptionType: string, className: string, subjectName?: string, endDate?: string, amount?: number) {
  const subscriptionName = subjectName ? `${className} - ${subjectName}` : className;
  const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Not specified';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ScioSprints</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to ScioSprints!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                    <strong>🎊 Congratulations! Your subscription is now active.</strong>
                </p>
            </div>
            
            <p>Thank you for choosing ScioSprints for your learning journey. You now have access to premium educational content!</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6;">
                <h3 style="margin-top: 0; color: #333;">Subscription Details:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong> ${subscriptionType}</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Access:</strong> ${subscriptionName}</li>
                    ${amount ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong> ₹${(amount/100).toFixed(2)}</li>` : ''}
                    <li style="padding: 8px 0;"><strong>Valid Until:</strong> ${formattedEndDate}</li>
                </ul>
            </div>
            
            <div style="background: #e7f3ff; border: 1px solid #b8daff; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #004085;">
                    <strong>🚀 What's Next?</strong>
                </p>
                <ul style="color: #004085; margin: 10px 0;">
                    <li>Explore your learning dashboard</li>
                    <li>Start with the recommended topics</li>
                    <li>Track your progress as you learn</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard" style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Start Learning Now
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Questions? Reply to this email or contact our support team at info@sciolabs.in
            </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 ScioSprints. All rights reserved.</p>
            <p>You received this email because you just subscribed to our service.</p>
        </div>
    </body>
    </html>
  `;
}

export function generatePaymentReceiptEmail(userName: string, paymentId: string, orderId: string, subscriptionName: string, amount: number, paymentDate: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">💳 Payment Receipt</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                    <strong>✅ Payment successful! Your transaction has been completed.</strong>
                </p>
            </div>
            
            <p>Thank you for your payment. Here are the details of your transaction:</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6;">
                <h3 style="margin-top: 0; color: #333;">Payment Details:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment ID:</strong> ${paymentId}</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Order ID:</strong> ${orderId}</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Description:</strong> ${subscriptionName}</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong> ₹${(amount/100).toFixed(2)}</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong> ${new Date(paymentDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</li>
                    <li style="padding: 8px 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">COMPLETED</span></li>
                </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                    <strong>💡 Keep this receipt for your records.</strong> If you need to contact support, please reference the Payment ID above.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    View Your Account
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Questions about this payment? Contact us at info@sciolabs.in
            </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
            <p>This is an automated receipt for your payment.</p>
        </div>
    </body>
    </html>
  `;
}

// DISABLED: Not present in emails.txt
// export function generateDemoRequestEmail(name: string, email: string, school: string, role: string) {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Demo Request Received</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
//             <h1 style="margin: 0; font-size: 24px;">🎯 Demo Request Received</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
//             <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            
//             <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                 <p style="margin: 0; color: #1e40af;">
//                     <strong>🎉 Thank you for your interest in Scio Labs!</strong>
//                 </p>
//             </div>
            
//             <p>We've received your demo request and our team will get back to you shortly. Here are the details we received:</p>
            
//             <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6;">
//                 <h3 style="margin-top: 0; color: #333;">Request Details:</h3>
//                 <ul style="list-style: none; padding: 0;">
//                     <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong> ${name}</li>
//                     <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong> ${email}</li>
//                     <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>School:</strong> ${school}</li>
//                     <li style="padding: 8px 0;"><strong>Role:</strong> ${role}</li>
//                 </ul>
//             </div>
            
//             <div style="background: #ecfdf5; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                 <p style="margin: 0; color: #166534;">
//                     <strong>⏰ What happens next?</strong>
//                 </p>
//                 <ul style="color: #166534; margin: 10px 0;">
//                     <li>Our team will review your request within 24 hours</li>
//                     <li>We'll schedule a personalized demo session</li>
//                     <li>You'll receive access to our platform features</li>
//                 </ul>
//             </div>
            
//             <div style="text-align: center; margin: 30px 0;">
//                 <a href="${SITE_URL}" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                     Visit Our Website
//                 </a>
//             </div>
            
//             <p style="color: #666; font-size: 14px; text-align: center;">
//                 Questions? Reply to this email or contact us at info@sciolabs.in
//             </p>
//         </div>
        
//         <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
//             <p>© 2025 Scio Labs. All rights reserved.</p>
//             <p>You received this email because you requested a demo of our platform.</p>
//         </div>
//     </body>
//     </html>
//   `;
// }

export function generateManualRenewalEmail(userName: string, className: string, newEndDate: string, amount: number, paymentId: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Renewed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔄 Subscription Renewed</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <div style="background: #cffafe; border: 1px solid #67e8f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #0e7490;">
                    <strong>🎊 Great news! You've successfully renewed your subscription to ${className}.</strong>
                </p>
            </div>
            
            <p>Thank you for continuing your learning journey with us. Your subscription has been extended and you can continue accessing all premium content.</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6;">
                <h3 style="margin-top: 0; color: #333;">Renewal Details:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Subscription:</strong> ${className}</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong> ₹${(amount/100).toFixed(2)}</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment ID:</strong> ${paymentId}</li>
                    <li style="padding: 8px 0;"><strong>New Expiry Date:</strong> ${new Date(newEndDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</li>
                </ul>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                    <strong>💡 Pro Tip:</strong> Enable auto-renewal in your account settings to never miss out on your learning progress!
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard" style="background: #0891b2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Continue Learning
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Questions? Reply to this email or contact our support team.
            </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
            <p>You received this email because you renewed your subscription with us.</p>
        </div>
    </body>
    </html>
  `;
}

// Admin notification emails
export function generateAdminNewSubscriptionEmail(userName: string, userEmail: string, subscriptionName: string, amount: number) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Subscription Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
                    🚀 New Subscription Created!
                </h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                    Revenue Alert - Admin Notification
                </p>
            </div>
            
            <div style="padding: 30px;">
                <h2 style="color: #333; margin-bottom: 20px;">New Subscription Details</h2>
                
                <div style="background: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #15803d;">Customer Information</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 5px 0;"><strong>Name:</strong> ${userName}</li>
                        <li style="padding: 5px 0;"><strong>Email:</strong> ${userEmail}</li>
                        <li style="padding: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #d97706;">Subscription Details</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 5px 0;"><strong>Subscription:</strong> ${subscriptionName}</li>
                        <li style="padding: 5px 0;"><strong>Amount:</strong> ₹${(amount/100).toFixed(2)}</li>
                        <li style="padding: 5px 0;"><strong>Status:</strong> Active</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/admin/subscriptions" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        View in Admin Panel
                    </a>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. Admin Notification System.</p>
        </div>
    </body>
    </html>
  `;
}

// DISABLED: Not present in emails.txt
// export function generateAdminPaymentFailedEmail(userName: string, userEmail: string, paymentId: string, failureReason: string, amount: number) {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Payment Failure Alert</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
//         <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
//             <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center;">
//                 <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
//                     🚨 Payment Failed!
//                 </h1>
//                 <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
//                     Requires Immediate Attention
//                 </p>
//             </div>
            
//             <div style="padding: 30px;">
//                 <h2 style="color: #333; margin-bottom: 20px;">Payment Failure Details</h2>
                
//                 <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
//                     <h3 style="margin: 0 0 15px 0; color: #dc2626;">Customer Information</h3>
//                     <ul style="list-style: none; padding: 0; margin: 0;">
//                         <li style="padding: 5px 0;"><strong>Name:</strong> ${userName}</li>
//                         <li style="padding: 5px 0;"><strong>Email:</strong> ${userEmail}</li>
//                         <li style="padding: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</li>
//                     </ul>
//                 </div>
                
//                 <div style="background: #fff7ed; border: 1px solid #ea580c; border-radius: 8px; padding: 20px; margin: 20px 0;">
//                     <h3 style="margin: 0 0 15px 0; color: #ea580c;">Payment Details</h3>
//                     <ul style="list-style: none; padding: 0; margin: 0;">
//                         <li style="padding: 5px 0;"><strong>Payment ID:</strong> ${paymentId}</li>
//                         <li style="padding: 5px 0;"><strong>Amount:</strong> ₹${(amount/100).toFixed(2)}</li>
//                         <li style="padding: 5px 0;"><strong>Failure Reason:</strong> ${failureReason}</li>
//                     </ul>
//                 </div>
                
//                 <div style="background: #f0f9ff; border: 1px solid #0891b2; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                     <p style="margin: 0; color: #0c4a6e;">
//                         <strong>Action Required:</strong> Please review this payment failure and contact the customer if necessary.
//                     </p>
//                 </div>
                
//                 <div style="text-align: center; margin: 30px 0;">
//                     <a href="${SITE_URL}/admin/payments" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                         View Payment Details
//                     </a>
//                 </div>
//             </div>
//         </div>
        
//         <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
//             <p>© 2025 Scio Labs. Admin Alert System.</p>
//         </div>
//     </body>
//     </html>
//   `;
// }

// DISABLED: Not present in emails.txt
// export function generateAdminSystemErrorEmail(errorType: string, errorMessage: string, location: string) {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>System Error Alert</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
//         <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
//             <div style="background: linear-gradient(135deg, #7c2d12 0%, #991b1b 100%); color: white; padding: 30px; text-align: center;">
//                 <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
//                     🔥 System Error Detected!
//                 </h1>
//                 <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
//                     Critical System Alert
//                 </p>
//             </div>
            
//             <div style="padding: 30px;">
//                 <h2 style="color: #333; margin-bottom: 20px;">Error Details</h2>
                
//                 <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
//                     <h3 style="margin: 0 0 15px 0; color: #dc2626;">System Error Information</h3>
//                     <ul style="list-style: none; padding: 0; margin: 0;">
//                         <li style="padding: 5px 0;"><strong>Error Type:</strong> ${errorType}</li>
//                         <li style="padding: 5px 0;"><strong>Location:</strong> ${location}</li>
//                         <li style="padding: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</li>
//                     </ul>
//                 </div>
                
//                 <div style="background: #fff1f2; border: 1px solid #f87171; border-radius: 8px; padding: 20px; margin: 20px 0;">
//                     <h3 style="margin: 0 0 15px 0; color: #dc2626;">Error Message</h3>
//                     <code style="background: #f3f4f6; padding: 10px; border-radius: 4px; display: block; word-break: break-all; font-family: monospace;">
//                         ${errorMessage}
//                     </code>
//                 </div>
                
//                 <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0;">
//                     <p style="margin: 0; color: #dc2626;">
//                         <strong>⚠️ URGENT:</strong> This error requires immediate investigation to prevent service disruption.
//                     </p>
//                 </div>
                
//                 <div style="text-align: center; margin: 30px 0;">
//                     <a href="${SITE_URL}/admin" style="background: #7c2d12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                         Access Admin Panel
//                     </a>
//                 </div>
//             </div>
//         </div>
        
//         <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
//             <p>© 2025 Scio Labs. System Monitoring Alert.</p>
//         </div>
//     </body>
//     </html>
//   `;
// }

// Helper function to generate email content based on notification type
export function generateEmailContent(type: string, data: Record<string, unknown>) {
  const userName = (data.userName as string) || 'Valued Customer';
  const className = (data.className as string) || (data.subjectName as string) || 'your subscription';
  
  switch (type) {
    case 'expiry_warning':
      const daysLeft = (data.daysUntilExpiry as number) || 7;
      const endDate = (data.endDate as string) || new Date().toISOString();
      return {
        subject: `⚠️ Your ${className} subscription expires in ${daysLeft} days`,
        html: generateExpiryWarningEmail(userName, className, daysLeft, endDate),
    text: `Hi ${userName},\n\nYour subscription to ${className} will expire in ${daysLeft} days on ${new Date(endDate).toLocaleDateString()}.\n\nTo continue your learning journey, please renew your subscription at ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScioSprints Team`
      };

    // DISABLED: Not present in emails.txt
    // case 'grace_period':
    //   const gracePeriodEndDate = (data.endDate as string) || new Date().toISOString();
    //   return {
    //     subject: `🔔 ${className} subscription in grace period`,
    //     html: generateGracePeriodEmail(userName, className, gracePeriodEndDate),
    //     text: `Hi ${userName},\n\nYour subscription to ${className} has expired but you're in a 7-day grace period.\n\nRenew now to continue your access: ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScioSprints Team`
    //   };

    // DISABLED: Not present in emails.txt
    // case 'renewal_reminder':
    //   return {
    //     subject: `🔄 Time to renew your ${className} subscription`,
    //     html: generateRenewalReminderEmail(userName, className),
    //     text: `Hi ${userName},\n\nIt's time to renew your subscription to ${className}.\n\nRenew now: ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScioSprints Team`
    //   };

    // DISABLED: Not present in emails.txt
    // case 'subscription_renewed':
    //   const newEndDate = (data.newEndDate as string) || new Date().toISOString();
    //   const amount = (data.amount as number) || 0;
    //   return {
    //     subject: `✅ ${className} subscription renewed successfully`,
    //     html: generateSubscriptionRenewedEmail(userName, className, newEndDate, amount),
    //     text: `Hi ${userName},\n\nGreat news! Your subscription to ${className} has been renewed successfully.\n\nNew expiry date: ${new Date(newEndDate).toLocaleDateString()}\n\nAmount charged: ₹${amount/100}\n\nBest regards,\nScioSprints Team`
    //   };

    // DISABLED: Not present in emails.txt
    // case 'auto_renewal_failed':
    //   return {
    //     subject: `❌ Auto-renewal failed for ${className}`,
    //     html: generateAutoRenewalFailedEmail(userName, className),
    //     text: `Hi ${userName},\n\nWe were unable to automatically renew your subscription to ${className}.\n\nPlease update your payment method and renew manually: ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScioSprints Team`
    //   };

    case 'new_subscription':
      const subscriptionType = (data.subscriptionType as string) || 'Premium Access';
      const subjectName = (data.subjectName as string);
      const subscriptionEndDate = (data.endDate as string) || new Date().toISOString();
      const welcomeSubscriptionAmount = (data.amount as number) || 0;
      return {
        subject: `🎉 Welcome to ${className} - Your subscription is active!`,
        html: generateWelcomeEmail(userName, subscriptionType, className, subjectName, subscriptionEndDate, welcomeSubscriptionAmount),
    text: `Hi ${userName},\n\nWelcome to ScioSprints! Your subscription to ${className} is now active.\n\nValid until: ${new Date(subscriptionEndDate).toLocaleDateString()}\n\nStart learning: ${SITE_URL}/dashboard\n\nBest regards,\nScioSprints Team`
      };

    case 'payment_receipt':
      const paymentId = (data.paymentId as string) || 'N/A';
      const orderId = (data.orderId as string) || 'N/A';
      const paymentAmount = (data.amount as number) || 0;
      const paymentDate = (data.paymentDate as string) || new Date().toISOString();
      const subscriptionName = (data.subscriptionName as string) || className;
      return {
        subject: `💳 Payment Receipt - ${subscriptionName}`,
        html: generatePaymentReceiptEmail(userName, paymentId, orderId, subscriptionName, paymentAmount, paymentDate),
    text: `Hi ${userName},\n\nPayment Receipt\n\nPayment ID: ${paymentId}\nOrder ID: ${orderId}\nAmount: ₹${(paymentAmount/100).toFixed(2)}\nDescription: ${subscriptionName}\n\nThank you for your payment!\n\nBest regards,\nScioSprints Team`
      };

    // DISABLED: Not present in emails.txt
    // case 'manual_renewal':
    //   const renewalEndDate = (data.newEndDate as string) || new Date().toISOString();
    //   const renewalAmount = (data.amount as number) || 0;
    //   const renewalPaymentId = (data.paymentId as string) || 'N/A';
    //   const renewalSubscriptionName = (data.subscriptionName as string) || className;
    //   return {
    //     subject: `🔄 Your ${renewalSubscriptionName} subscription renewed successfully`,
    //     html: generateManualRenewalEmail(userName, renewalSubscriptionName, renewalEndDate, renewalAmount, renewalPaymentId),
    //     text: `Hi ${userName},\n\nYour subscription to ${renewalSubscriptionName} has been renewed successfully!\n\nNew expiry date: ${new Date(renewalEndDate).toLocaleDateString()}\nAmount paid: ₹${(renewalAmount/100).toFixed(2)}\n\nContinue learning: ${SITE_URL}/dashboard\n\nBest regards,\nScioSprints Team`
    //   };

    // DISABLED: Not present in emails.txt
    // case 'demo_request':
    //   const requestorName = (data.name as string) || userName;
    //   const email = (data.email as string) || '';
    //   const school = (data.school as string) || '';
    //   const role = (data.role as string) || '';
    //   return {
    //     subject: `🎯 Demo request received - We'll be in touch soon!`,
    //     html: generateDemoRequestEmail(requestorName, email, school, role),
    //     text: `Hi ${requestorName},\n\nThank you for your interest in ScioSprints!\n\nWe've received your demo request and our team will contact you within 24 hours.\n\nDetails:\nName: ${requestorName}\nEmail: ${email}\nSchool: ${school}\nRole: ${role}\n\nBest regards,\nScioSprints Team`
    //   };

    // Admin notification email types
    case 'admin_new_subscription':
      const adminSubscriptionName = (data.subscriptionName as string) || className;
      const userEmail = (data.userEmail as string) || '';
      const adminSubscriptionAmount = (data.amount as number) || 0;
      return {
        subject: `🚀 New Subscription Alert - ${adminSubscriptionName}`,
        html: generateAdminNewSubscriptionEmail(userName, userEmail, adminSubscriptionName, adminSubscriptionAmount),
        text: `New Subscription Created\n\nUser: ${userName} (${userEmail})\nSubscription: ${adminSubscriptionName}\nAmount: ₹${(adminSubscriptionAmount/100).toFixed(2)}\nTime: ${new Date().toLocaleString()}`
      };

    // DISABLED: Not present in emails.txt
    // case 'admin_payment_failed':
    //   const failedPaymentId = (data.paymentId as string) || 'N/A';
    //   const failureReason = (data.failureReason as string) || 'Unknown error';
    //   const failedAmount = (data.amount as number) || 0;
    //   return {
    //     subject: `🚨 Payment Failure Alert - ${userName}`,
    //     html: generateAdminPaymentFailedEmail(userName, (data.userEmail as string) || '', failedPaymentId, failureReason, failedAmount),
    //     text: `Payment Failed\n\nUser: ${userName} (${data.userEmail || ''})\nPayment ID: ${failedPaymentId}\nAmount: ₹${(failedAmount/100).toFixed(2)}\nReason: ${failureReason}\nTime: ${new Date().toLocaleString()}`
    //   };

    // DISABLED: Not present in emails.txt
    // case 'admin_system_error':
    //   const errorType = (data.errorType as string) || 'System Error';
    //   const errorMessage = (data.errorMessage as string) || 'Unknown error occurred';
    //   const errorLocation = (data.location as string) || 'Unknown';
    //   return {
    //     subject: `🔥 System Error Alert - ${errorType}`,
    //     html: generateAdminSystemErrorEmail(errorType, errorMessage, errorLocation),
    //     text: `System Error Detected\n\nType: ${errorType}\nLocation: ${errorLocation}\nMessage: ${errorMessage}\nTime: ${new Date().toLocaleString()}\n\nImmediate attention required.`
    //   };

    default:
      return {
        subject: 'Notification from Scio Sprints',
        html: `<p>Hi ${userName},</p><p>We have an update regarding your subscription.</p>`,
        text: `Hi ${userName}, We have an update regarding your subscription.`
      };
  }
}