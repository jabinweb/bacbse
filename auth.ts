import NextAuth from "next-auth"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./authConfig"
import { UserRole } from "@prisma/client"
import { logLogin } from "@/lib/activity-logger"

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  experimental: {
    enableWebAuthn: false,
  },
  providers: [
    ...authConfig.providers,
    Nodemailer({
      server: getSmtpConfig(),
      from: process.env.EMAIL_FROM || 'info@sciolabs.in',
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          console.log('🚀 Starting email verification process for:', email);
          
          const { host } = new URL(url)
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
        
        console.log('📧 Attempting to send email to:', email);
        
        const result = await transport.sendMail({
          to: email,
          from: fromAddress,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${url}\n\n`,
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
                          <a href="${url}" target="_blank"
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
            stack: error instanceof Error ? error.stack : undefined
          });
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