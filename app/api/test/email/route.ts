import { NextRequest, NextResponse } from "next/server";
import { createTransport } from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log('🧪 Testing SMTP configuration...');
    
    // Get SMTP settings from environment
    const smtpConfig = {
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER || 'jabincreators@gmail.com',
        pass: process.env.EMAIL_SERVER_PASSWORD || '', // Use App Password for Gmail
      },
    };

    console.log('🔧 SMTP Test Configuration:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user,
      hasPassword: !!smtpConfig.auth.pass,
      secure: smtpConfig.secure
    });

    // Create transporter
    const transporter = createTransport(smtpConfig);

    // Test connection first
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Send test email
    console.log('📧 Sending test email to:', email);
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'jabincreators@gmail.com',
      to: email,
      subject: 'Test Email from Scio Sprints',
      text: 'This is a test email to verify SMTP configuration.',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify SMTP configuration.</p>
        <p>If you received this, your SMTP settings are working correctly!</p>
      `,
    });

    console.log('✅ Test email sent successfully:', result);

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully",
      messageId: result.messageId,
      smtpConfig: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.auth.user
      }
    });

  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    
    let errorMessage = 'SMTP test failed';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('EAUTH')) {
        errorDetails = 'Authentication failed - check username/password';
      } else if (error.message.includes('ENOTFOUND')) {
        errorDetails = 'Host not found - check SMTP host setting';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorDetails = 'Connection refused - check SMTP port and host';
      } else if (error.message.includes('timeout')) {
        errorDetails = 'Connection timed out - check network/firewall';
      }
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
      success: false 
    }, { status: 500 });
  }
}