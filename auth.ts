import NextAuth from "next-auth"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./authConfig"
import { UserRole } from "@prisma/client"
import { logLogin } from "@/lib/activity-logger"
import type { Adapter } from "next-auth/adapters"

// Helper function to get SMTP settings synchronously for NextAuth
function getSmtpConfig() {
  return {
    host: process.env.EMAIL_SERVER_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    auth: {
      user: process.env.EMAIL_SERVER_USER || 'info@sciolabs.in',
      pass: process.env.EMAIL_SERVER_PASSWORD || '',
    },
  };
}

console.log('🟦 NextAuth configuration initializing...');
console.log('🟦 Environment check:', {
  hasAuthSecret: !!process.env.AUTH_SECRET,
  hasEmailHost: !!process.env.EMAIL_SERVER_HOST,
  hasEmailUser: !!process.env.EMAIL_SERVER_USER,
  hasEmailPassword: !!process.env.EMAIL_SERVER_PASSWORD,
  hasEmailFrom: !!process.env.EMAIL_FROM,
  nodeEnv: process.env.NODE_ENV,
});

// Dynamically set NEXTAUTH_URL if not set
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  console.log('🔧 Dynamically set NEXTAUTH_URL to:', process.env.NEXTAUTH_URL);
} else if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
  // For Coolify and other deployment platforms, try common environment variables
  const possibleUrls = [
    process.env.PUBLIC_URL,
    process.env.RAILWAY_STATIC_URL,
    process.env.RENDER_EXTERNAL_URL,
    process.env.APP_URL,
    process.env.SITE_URL
  ].filter(Boolean);
  
  if (possibleUrls.length > 0) {
    process.env.NEXTAUTH_URL = possibleUrls[0];
    console.log('🔧 Dynamically set NEXTAUTH_URL from deployment env to:', process.env.NEXTAUTH_URL);
  } else {
    console.log('⚠️ NEXTAUTH_URL not set in production environment - will use request host');
  }
}

console.log('🔧 Current NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set (will use request host)');

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.AUTH_SECRET,
  // Additional configuration for Coolify/deployment compatibility
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(error: Error) {
      console.error('🔴 NextAuth Error:', error);
    },
    warn(code) {
      console.warn('🟡 NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('🔵 NextAuth Debug:', code, metadata);
    }
  },
  experimental: {
    enableWebAuthn: false,
  },
  providers: [
    ...authConfig.providers,
    Nodemailer({
      server: getSmtpConfig(),
      from: process.env.EMAIL_FROM || 'info@sciolabs.in',
      sendVerificationRequest: async ({ identifier: email, url }) => {
        console.log('🟦 Nodemailer provider: sendVerificationRequest called');
        console.log('🟦 Email:', email);
        console.log('🟦 Original URL:', url);
        
        // Fix localhost URL issue in Coolify deployments
        let fixedUrl = url;
        if (url.includes('localhost:3000') && process.env.NODE_ENV === 'production') {
          // Try to get the external URL from environment variables
          const externalUrl = process.env.NEXTAUTH_URL || 
                              process.env.PUBLIC_URL || 
                              process.env.APP_URL || 
                              process.env.SITE_URL;
          
          // If no environment variable is set, provide helpful logging
          if (!externalUrl && url.includes('localhost:3000')) {
            console.log('⚠️ IMPORTANT: Set NEXTAUTH_URL environment variable to your external domain');
            console.log('⚠️ Example: NEXTAUTH_URL=http://mck8ckswwc84g0k8kk0w40sk.72.60.203.46.sslip.io');
            console.log('⚠️ This will ensure email links work correctly in Coolify');
          }
          
          if (externalUrl) {
            fixedUrl = url.replace('http://localhost:3000', externalUrl);
            console.log('🔧 Fixed URL for deployment:', fixedUrl);
          } else {
            console.log('⚠️ Could not fix localhost URL - no external URL found');
          }
        }
        
        try {
          console.log('🚀 Starting email verification process for:', email);
          
          const { host } = new URL(fixedUrl)
          const { createTransport } = await import("nodemailer")
          
          // Get base SMTP config from environment variables
          let smtpConfig = {
            host: process.env.EMAIL_SERVER_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
            auth: {
              user: process.env.EMAIL_SERVER_USER || 'info@sciolabs.in',
              pass: process.env.EMAIL_SERVER_PASSWORD || '',
            },
          };
          let fromAddress = process.env.EMAIL_FROM || 'info@sciolabs.in';
        
        try {
          const dbSettings = await prisma.adminSettings.findMany({
            where: {
              key: {
                in: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom']
              }
            },
            select: {
              key: true,
              value: true
            }
          });

          if (dbSettings.length > 0) {
            const settingsObj = dbSettings.reduce((acc: Record<string, string>, setting) => {
              acc[setting.key] = setting.value;
              return acc;
            }, {});

            // Override with database settings if available
            smtpConfig = {
              host: settingsObj.smtpHost || smtpConfig.host,
              port: parseInt(settingsObj.smtpPort || String(smtpConfig.port)),
              auth: {
                user: settingsObj.smtpUser || smtpConfig.auth.user,
                pass: settingsObj.smtpPass || smtpConfig.auth.pass,
              },
            };

            fromAddress = settingsObj.smtpFrom || fromAddress;
          }
        } catch (error) {
          console.error('Error fetching SMTP settings from database for email verification, using env config:', error);
        }
        
        console.log('🔧 SMTP Configuration:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          user: smtpConfig.auth.user,
          from: fromAddress,
          hasPassword: !!smtpConfig.auth.pass
        });
        
        const transport = createTransport(smtpConfig)
        
        // Test SMTP connection before sending
        console.log('🔍 Testing SMTP connection...');
        try {
          await transport.verify();
          console.log('✅ SMTP connection verified successfully');
        } catch (verifyError) {
          console.error('❌ SMTP connection failed:', verifyError);
          throw new Error('SMTP connection failed - check your email settings');
        }
        
        console.log('📧 Attempting to send email to:', email);
        console.log('📧 Email details:', {
          to: email,
          from: fromAddress,
          subject: `Sign in to ${host}`,
          url: fixedUrl
        });
        
        const result = await transport.sendMail({
          to: email,
          from: fromAddress,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${fixedUrl}\n\n`,
          html: `
            <body style="background: #f9f9f9;">
              <table width="100%" border="0" cellspacing="20" cellpadding="0"
                style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;">
                <tr>
                  <td align="center"
                    style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
                    Sign in to <strong>Scio Sprints</strong>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 5px;" bgcolor="#346df1">
                          <a href="${fixedUrl}" target="_blank"
                            style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #fff; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid #346df1; display: inline-block; font-weight: bold;">
                            Sign in
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center"
                    style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
                    If you did not request this email you can safely ignore it.
                  </td>
                </tr>
              </table>
            </body>
          `,
        })
        
        const failed = result.rejected.concat(result.pending).filter(Boolean)
        if (failed.length) {
          console.error('❌ Email delivery failed:', failed);
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
        }
        
        console.log('✅ Email sent successfully to:', email);
        
        } catch (error) {
          console.error('❌ Email verification error:', {
            email,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            smtpHost: smtpConfig.host,
            smtpPort: smtpConfig.port,
            smtpUser: smtpConfig.auth.user
          });
          
          // Provide more specific error messages
          let errorMessage = 'Failed to send sign-in email. Please try again.';
          if (error instanceof Error) {
            if (error.message.includes('EAUTH') || error.message.includes('authentication')) {
              errorMessage = 'Email authentication failed - check SMTP credentials';
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
              errorMessage = 'Email server connection failed - check SMTP host/port';
            } else if (error.message.includes('timeout')) {
              errorMessage = 'Email sending timed out - please try again';
            }
          }
          
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for consistency with middleware
  },
  callbacks: {
    async signIn({ user, profile }) {
      // Update user information when they sign in
      if (user.email) {
        try {
          const updatedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || profile?.name || user.email.split('@')[0],
              image: user.image || profile?.picture,
              lastLoginAt: new Date(),
            },
            create: {
              email: user.email,
              name: user.name || profile?.name || user.email.split('@')[0],
              image: user.image || profile?.picture,
              role: UserRole.USER,
              isActive: true,
              lastLoginAt: new Date(),
            },
          })
          
          // Log login activity
          if (updatedUser.id) {
            await logLogin(updatedUser.id).catch(err => 
              console.error('Failed to log login activity:', err)
            );
          }
        } catch (error) {
          console.error('Error updating user:', error)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ""
        session.user.role = token.role ? String(token.role) as typeof session.user.role : UserRole.USER
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})