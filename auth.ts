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
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER || 'info@sciolabs.in',
      pass: process.env.EMAIL_SERVER_PASSWORD || '',
    },
    // Additional options for better deliverability
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    },
  };
}



// Dynamically set NEXTAUTH_URL if not set
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
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
    process.env.NEXTAUTH_URL = possibleUrls[0];
  }
}



export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.AUTH_SECRET,
  // Additional configuration for Coolify/deployment compatibility

  experimental: {
    enableWebAuthn: false,
  },
  providers: [
    ...authConfig.providers,
    Nodemailer({
      server: getSmtpConfig(),
      from: process.env.EMAIL_FROM || 'info@sciolabs.in',
      sendVerificationRequest: async ({ identifier: email, url }) => {

        
        // Fix localhost URL issue in Coolify deployments
        let fixedUrl = url;
        if (url.includes('localhost:3000') && process.env.NODE_ENV === 'production') {
          // Try to get the external URL from environment variables
          const externalUrl = process.env.NEXTAUTH_URL || 
                              process.env.PUBLIC_URL || 
                              process.env.APP_URL || 
                              process.env.SITE_URL;
          
          if (externalUrl) {
            fixedUrl = url.replace('http://localhost:3000', externalUrl);
          }
        }
        
        try {
          const { createTransport } = await import("nodemailer")
          
          // Get base SMTP config from environment variables
          let smtpConfig = {
            host: process.env.EMAIL_SERVER_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
              user: process.env.EMAIL_SERVER_USER || 'info@sciolabs.in',
              pass: process.env.EMAIL_SERVER_PASSWORD || '',
            },
            // Additional options for better deliverability
            tls: {
              rejectUnauthorized: false
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
              secure: smtpConfig.secure, // Keep the original secure setting
              auth: {
                user: settingsObj.smtpUser || smtpConfig.auth.user,
                pass: settingsObj.smtpPass || smtpConfig.auth.pass,
              },
              tls: smtpConfig.tls, // Keep the original TLS settings
            };

            fromAddress = settingsObj.smtpFrom || fromAddress;
          }
        } catch {
          // Silently use environment config if database fetch fails
        }
        
        const transport = createTransport(smtpConfig)
        
        const result = await transport.sendMail({
          to: email,
          from: `"Scio Sprints" <${fromAddress}>`, // Better from format
          replyTo: fromAddress,
          subject: `Your sign-in link for Scio Sprints`,
          text: `Hello,\n\nClick the link below to sign in to Scio Sprints:\n${fixedUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not request this email, you can safely ignore it.\n\nBest regards,\nScio Sprints Team`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Sign in to Scio Sprints</title>
            </head>
            <body style="background-color: #f9f9f9; margin: 0; padding: 20px; font-family: Arial, sans-serif;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background-color: #346df1;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Scio Sprints</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">Sign in to your account</h2>
                    <p style="color: #666666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">
                      Click the button below to securely sign in to your Scio Sprints account.
                    </p>
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 6px; background-color: #346df1;">
                          <a href="${fixedUrl}" 
                             style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px;"
                             target="_blank">
                            Sign In Now
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #999999; margin: 30px 0 0 0; font-size: 14px; line-height: 1.5;">
                      This link will expire in 24 hours for security reasons.<br>
                      If you didn't request this email, you can safely ignore it.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                    <p style="color: #666666; margin: 0; font-size: 12px;">
                      This email was sent by Scio Sprints. If you have questions, please contact support.
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        })
        
        const failed = result.rejected.concat(result.pending).filter(Boolean)
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
        }
        
        } catch {
          throw new Error('Failed to send sign-in email. Please try again.');
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