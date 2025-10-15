import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PaymentStatus } from '@prisma/client';
import { getAcademicYearEndDate } from '@/lib/subscription-date-utils';

// Manual payment verification endpoint for failed automatic verifications
export async function POST(req: Request) {
  console.log('[ManualVerify] Starting manual payment verification');

  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, orderId, forceReprocess } = await req.json();

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: 'Payment ID or Order ID is required' }, { status: 400 });
    }

    console.log('[ManualVerify] Looking for payment:', { paymentId, orderId });

    // Find payment record
    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });
    } else if (orderId) {
      payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { razorpayOrderId: orderId },
            { cashfreeOrderId: orderId }
          ]
        }
      });
    }

    if (!payment) {
      console.error('[ManualVerify] Payment record not found');
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Check if user has permission to verify this payment
    if (payment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to verify this payment' }, { status: 403 });
    }

    console.log('[ManualVerify] Payment found:', {
      id: payment.id,
      status: payment.status,
      gateway: payment.gateway,
      userId: payment.userId
    });

    // If payment is already completed and user doesn't want to force reprocess
    if (payment.status === PaymentStatus.COMPLETED && !forceReprocess) {
      // Check if subscription already exists
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: payment.userId,
          OR: [
            { 
              AND: [
                { classId: { not: null } },
                { subjectId: null }
              ]
            },
            { subjectId: { not: null } }
          ],
          status: 'ACTIVE',
          created_at: {
            gte: new Date(payment.created_at.getTime() - 5 * 60 * 1000), // 5 minutes before payment
            lte: new Date(payment.created_at.getTime() + 30 * 60 * 1000) // 30 minutes after payment
          }
        }
      });

      if (existingSubscription) {
        return NextResponse.json({
          verified: true,
          message: 'Payment already verified and subscription exists',
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount
          },
          subscription: existingSubscription
        });
      }
    }

    // Attempt to process subscription if metadata exists and payment is completed
    if (payment.status === PaymentStatus.COMPLETED && payment.metadata) {
      try {
        const metadata = typeof payment.metadata === 'string' 
          ? JSON.parse(payment.metadata) 
          : payment.metadata;

        console.log('[ManualVerify] Processing subscription with metadata:', metadata);

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

          if (!existingSubscription || forceReprocess) {
            const endDate = getAcademicYearEndDate(); // Academic year ends March 31st
            
            if (existingSubscription && forceReprocess) {
              // Update existing subscription
              await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                  amount: payment.amount,
                  endDate: endDate,
                  updatedAt: new Date()
                }
              });
            } else {
              // Create new subscription
              await prisma.subscription.create({
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
            }

            console.log('[ManualVerify] Class subscription created/updated successfully');
          }
        } else if (metadata.type === 'subject_subscription') {
          const subjectIds: string[] = metadata.subjectIds || (metadata.subjectId ? [metadata.subjectId] : []);
          
          if (subjectIds.length > 0) {
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

            if (newSubjectIds.length > 0 || forceReprocess) {
              const endDate = getAcademicYearEndDate(); // Academic year ends March 31st
              const subscriptionData = (forceReprocess ? subjectIds : newSubjectIds).map((subjectId: string) => ({
                userId: metadata.userId,
                subjectId: subjectId,
                status: 'ACTIVE' as const,
                planType: 'subject_subscription' as const,
                amount: Math.floor((payment.amount || 0) / subjectIds.length),
                currency: payment.currency || 'INR',
                startDate: new Date(),
                endDate: endDate
              }));

              if (forceReprocess) {
                // Delete existing subscriptions and create new ones
                await prisma.subscription.deleteMany({
                  where: {
                    userId: metadata.userId,
                    subjectId: { in: subjectIds },
                    status: 'ACTIVE'
                  }
                });
              }

              await prisma.subscription.createMany({
                data: subscriptionData
              });

              console.log('[ManualVerify] Subject subscriptions created successfully');
            }
          }
        }

        return NextResponse.json({
          verified: true,
          message: 'Payment verified and subscription processed manually',
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            gateway: payment.gateway
          }
        });

      } catch (subscriptionError) {
        console.error('[ManualVerify] Failed to process subscription:', subscriptionError);
        return NextResponse.json({
          verified: true,
          message: 'Payment verified but subscription processing failed',
          error: subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error',
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount
          }
        }, { status: 207 }); // 207 Multi-Status - partial success
      }
    }

    // If payment is not completed, return current status
    return NextResponse.json({
      verified: false,
      message: `Payment status is ${payment.status}`,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        gateway: payment.gateway
      }
    });

  } catch (error) {
    console.error('[ManualVerify] Manual verification error:', error);
    
    return NextResponse.json({
      error: 'Manual verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}