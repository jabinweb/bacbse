import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
// import { logTopicStarted } from '@/lib/activity-logger';

// Server-side function to verify topic access
async function verifyTopicAccess(userId: string, topicId: string) {
  try {
    // Get topic with subject and class info
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        chapter: {
          include: {
            subject: {
              include: {
                class: true
              }
            }
          }
        }
      }
    });

    if (!topic) return { hasAccess: false, topic: null };

    // Get user with school info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true }
    });

    if (!user) return { hasAccess: false, topic };

    const classId = topic.chapter.subject.classId;
    const subjectId = topic.chapter.subjectId;

    // Check individual subscriptions
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
        OR: [
          { classId: classId },
          { subjectId: subjectId }
        ]
      }
    });

    return { hasAccess: !!subscription, topic };
  } catch (error) {
    console.error('Error verifying topic access:', error);
    return { hasAccess: false, topic: null };
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;

  try {
    // Get topic content only if user has access
    const topicWithContent = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        content: true
      }
    });

    if (!topicWithContent?.content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Log topic access activity
    // await logTopicStarted(session.user.id, topicId, topic.name);

    // Return only the content data that the ContentPlayer needs
    return NextResponse.json({
      id: topicWithContent.id,
      name: topicWithContent.name,
      description: topicWithContent.description,
      type: topicWithContent.type,
      duration: topicWithContent.duration,
      content: {
        contentType: topicWithContent.content.contentType,
        url: topicWithContent.content.url,
        videoUrl: topicWithContent.content.videoUrl,
        pdfUrl: topicWithContent.content.pdfUrl,
        textContent: topicWithContent.content.textContent,
        iframeHtml: topicWithContent.content.iframeHtml,
        widgetConfig: topicWithContent.content.widgetConfig
      }
    });

  } catch (error) {
    console.error('Error fetching topic content:', error);
    return NextResponse.json({ error: 'Failed to fetch topic content' }, { status: 500 });
  }
}