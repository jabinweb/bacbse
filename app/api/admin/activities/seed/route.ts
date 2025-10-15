import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { 
  logLogin, 
  logLogout, 
  logTopicStarted, 
  logTopicCompleted,
  logSubscriptionCreated,
  logPaymentInitiated,
  logPaymentCompleted,
  logPaymentFailed,
  logProfileUpdated,
  logClassAccessed,
  logSubjectAccessed
} from '@/lib/activity-logger';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get some users to create activities for
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, name: true, email: true }
    });

    if (users.length === 0) {
      return NextResponse.json({ error: 'No users found to create activities for' }, { status: 400 });
    }

    const activities = [];
    const sampleIpAddress = '192.168.1.100';
    const sampleUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    // Create various activities for each user
    for (const user of users) {
      // Login activity
      await logLogin(user.id, sampleIpAddress, sampleUserAgent);
      activities.push(`Login activity for ${user.name || user.email}`);

      // Class accessed
      await logClassAccessed(user.id, 10, 'Class 10', sampleIpAddress, sampleUserAgent);
      activities.push(`Class access activity for ${user.name || user.email}`);

      // Subject accessed
      await logSubjectAccessed(user.id, 'math-001', 'Mathematics', sampleIpAddress, sampleUserAgent);
      activities.push(`Subject access activity for ${user.name || user.email}`);

      // Topic activities
      await logTopicStarted(user.id, 'topic-001', 'Introduction to Algebra', sampleIpAddress, sampleUserAgent);
      activities.push(`Topic started activity for ${user.name || user.email}`);

      await logTopicCompleted(user.id, 'topic-001', 'Introduction to Algebra', 1800, sampleIpAddress, sampleUserAgent);
      activities.push(`Topic completed activity for ${user.name || user.email}`);

      // Payment activities
      await logPaymentInitiated(user.id, `pay_${user.id}_001`, 29900, 'RAZORPAY', sampleIpAddress, sampleUserAgent);
      activities.push(`Payment initiated activity for ${user.name || user.email}`);

      await logPaymentCompleted(user.id, `pay_${user.id}_001`, 29900, 'RAZORPAY', sampleIpAddress, sampleUserAgent);
      activities.push(`Payment completed activity for ${user.name || user.email}`);

      // Subscription created
      await logSubscriptionCreated(user.id, `sub_${user.id}_001`, 'Class 10 Full Access', 29900, sampleIpAddress, sampleUserAgent);
      activities.push(`Subscription created activity for ${user.name || user.email}`);

      // Profile updated
      await logProfileUpdated(user.id, ['name', 'phone'], sampleIpAddress, sampleUserAgent);
      activities.push(`Profile update activity for ${user.name || user.email}`);
    }

    // Create some failed payment activities
    const failedUser = users[0];
    await logPaymentFailed(
      failedUser.id, 
      `pay_${failedUser.id}_failed`, 
      7500, 
      'CASHFREE', 
      'Insufficient funds',
      sampleIpAddress, 
      sampleUserAgent
    );
    activities.push(`Payment failed activity for ${failedUser.name || failedUser.email}`);

    // Create logout activities for some users
    for (let i = 0; i < Math.min(3, users.length); i++) {
      await logLogout(users[i].id, sampleIpAddress, sampleUserAgent);
      activities.push(`Logout activity for ${users[i].name || users[i].email}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${activities.length} sample activities`,
      activities: activities.slice(0, 10), // Return first 10 for reference
      totalActivities: activities.length
    });

  } catch (error) {
    console.error('Error creating sample activities:', error);
    return NextResponse.json(
      { error: 'Failed to create sample activities' },
      { status: 500 }
    );
  }
}