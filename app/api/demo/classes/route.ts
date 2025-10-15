import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    // Fetch a specific class or the first available class for demo
    const demoClass = await prisma.class.findFirst({
      where: {
        isActive: true,
        ...(classId && { id: parseInt(classId) }),
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
      }
    });

    if (!demoClass) {
      return NextResponse.json({
        error: 'No demo class available'
      }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedClass = {
      id: demoClass.id,
      name: demoClass.name,
      description: demoClass.description,
      price: demoClass.price,
      currency: demoClass.currency,
      subjects: demoClass.subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        isLocked: subject.isLocked,
        price: subject.price,
        currency: subject.currency,
        chapters: subject.chapters.map((chapter, chapterIndex) => ({
          id: chapter.id,
          name: chapter.name,
          isLocked: chapterIndex > 0, // First chapter (index 0) is free, rest are locked
          topics: chapter.topics.map(topic => ({
            id: topic.id,
            name: topic.name,
            type: topic.type,
            duration: topic.duration || '5 min',
            description: topic.description,
            difficulty: topic.difficulty || 'BEGINNER',
            completed: false, // For demo, all topics start as not completed
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
    };

    return NextResponse.json({
      success: true,
      data: transformedClass
    });

  } catch (error) {
    console.error('Demo API Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch demo data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}