import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all active classes for demo
    const classes = await prisma.class.findMany({
      where: {
        isActive: true,
      },
      include: {
        subjects: {
          orderBy: {
            orderIndex: 'asc'
          },
          include: {
            chapters: {
              orderBy: {
                orderIndex: 'asc'
              },
              include: {
                topics: {
                  orderBy: {
                    orderIndex: 'asc'
                  },
                  include: {
                    content: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Transform the data to a format suitable for demo
    const transformedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      description: cls.description,
      price: cls.price || 29900, // Default price if not set
      currency: cls.currency || 'INR',
      subjectCount: cls.subjects.length,
      chapterCount: cls.subjects.reduce((acc, subject) => acc + subject.chapters.length, 0),
      topicCount: cls.subjects.reduce((acc, subject) => 
        acc + subject.chapters.reduce((chAcc, chapter) => chAcc + chapter.topics.length, 0), 0
      ),
      subjects: cls.subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        isLocked: subject.isLocked,
        price: subject.price,
        chapters: subject.chapters.map(chapter => ({
          id: chapter.id,
          name: chapter.name,
          topics: chapter.topics.map(topic => ({
            id: topic.id,
            name: topic.name,
            type: topic.type,
            duration: topic.duration || '5 min',
            description: topic.description,
            completed: false, // Demo topics start as not completed
            content: {
              type: topic.content?.contentType || 'TEXT',
              value: topic.content?.iframeHtml || topic.content?.textContent || topic.content?.url || '',
              url: topic.content?.url,
              videoUrl: topic.content?.videoUrl,
              pdfUrl: topic.content?.pdfUrl,
              textContent: topic.content?.textContent,
              iframeHtml: topic.content?.iframeHtml,
              widgetConfig: topic.content?.widgetConfig
            }
          }))
        }))
      }))
    }));

    return NextResponse.json({
      success: true,
      data: transformedClasses
    });

  } catch (error) {
    console.error('Demo Classes API Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch demo classes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}