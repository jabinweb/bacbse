import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Helper function to convert content type to database enum
const convertContentType = (type: string): 'EXTERNAL_LINK' | 'VIDEO' | 'PDF' | 'TEXT' | 'INTERACTIVE_WIDGET' | 'IFRAME' => {
  switch (type.toLowerCase()) {
    case 'external_link': return 'EXTERNAL_LINK';
    case 'video': return 'VIDEO';
    case 'pdf': return 'PDF';
    case 'text': return 'TEXT';
    case 'interactive_widget': return 'INTERACTIVE_WIDGET';
    case 'iframe': return 'IFRAME';
    default: return 'EXTERNAL_LINK';
  }
};

// Helper function to convert topic type to database enum
const convertTopicType = (type: string): 'VIDEO' | 'INTERACTIVE' | 'EXERCISE' | 'AUDIO' => {
  switch (type.toLowerCase()) {
    case 'video': return 'VIDEO';
    case 'interactive': return 'INTERACTIVE';
    case 'exercise': return 'EXERCISE';
    case 'audio': return 'AUDIO';
    default: return 'VIDEO';
  }
};

// Helper function to convert difficulty to database enum
const convertDifficultyLevel = (difficulty: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' => {
  switch (difficulty?.toUpperCase()) {
    case 'BEGINNER': return 'BEGINNER';
    case 'INTERMEDIATE': return 'INTERMEDIATE';
    case 'ADVANCED': return 'ADVANCED';
    default: return 'BEGINNER';
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    
    const topics = await prisma.topic.findMany({
      where: chapterId ? { chapterId } : {},
      include: {
        content: true
      },
      orderBy: { orderIndex: 'asc' }
    });

    // Transform the response to ensure content is properly structured
    const transformedTopics = topics.map(topic => {
      let content = undefined;
      
      if (topic.content) {
        // topic.content is a single object, not an array (one-to-one relationship)
        content = {
          contentType: topic.content.contentType?.toLowerCase() || 'external_link', // Convert to lowercase for form
          url: topic.content.url,
          videoUrl: topic.content.videoUrl,
          pdfUrl: topic.content.pdfUrl,
          textContent: topic.content.textContent,
          iframeHtml: topic.content.iframeHtml,
          widgetConfig: topic.content.widgetConfig,
        };
      }
      
      console.log(`Topic ${topic.name} content:`, content); // Debug log
      
      return {
        ...topic,
        content
      };
    });

    console.log('Returning transformed topics:', transformedTopics);
    return NextResponse.json(transformedTopics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, duration, difficulty, orderIndex, chapterId, content, description } = await request.json();

    if (!name || !type || !chapterId) {
      return NextResponse.json({ error: 'Missing required fields: name, type, and chapterId are required' }, { status: 400 });
    }

    // Create topic
    const topic = await prisma.topic.create({
      data: {
        id: crypto.randomUUID(),
        name,
        type: convertTopicType(type), // Convert to proper enum
        duration: duration && duration.trim() !== '' ? duration : null, // Handle empty duration
        difficulty: convertDifficultyLevel(difficulty || 'BEGINNER'), // Convert to proper enum with default
        orderIndex: orderIndex || 0,
        chapterId,
        description: description && description.trim() !== '' ? description : null,
        created_at: new Date(),
        updatedAt: new Date(),
      }
    });

    // Create content if provided
    if (content && topic) {
      try {
        await prisma.topicContent.create({
          data: {
            id: crypto.randomUUID(),
            topicId: topic.id,
            contentType: convertContentType(content.contentType), // Convert to proper enum
            url: content.url || null,
            videoUrl: content.videoUrl || null,
            pdfUrl: content.pdfUrl || null,
            textContent: content.textContent || null,
            iframeHtml: content.iframeHtml || null,
            widgetConfig: content.widgetConfig || null,
            created_at: new Date(),
            updatedAt: new Date(),
          }
        });
      } catch (contentError) {
        console.error('Error creating topic content:', contentError);
        // Don't throw here, topic is already created
      }
    }

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, type, duration, difficulty, orderIndex, content, description } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    // Build update data only for provided fields to avoid overwriting unspecified fields
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof name === 'string') updateData.name = name;
    if (typeof type === 'string') updateData.type = convertTopicType(type);
    if (typeof duration === 'string') updateData.duration = duration && duration.trim() !== '' ? duration : null;
    if (typeof difficulty === 'string') updateData.difficulty = convertDifficultyLevel(difficulty);
    if (typeof orderIndex !== 'undefined') updateData.orderIndex = orderIndex;
    if (typeof description === 'string') updateData.description = description && description.trim() !== '' ? description : null;

    // Update topic
    await prisma.topic.update({
      where: { id },
      data: updateData
    });

    // Handle content update with proper enum conversion
    if (content) {
      // First check if content exists
      const existingContent = await prisma.topicContent.findFirst({
        where: { topicId: id },
        select: { id: true }
      });

      if (existingContent) {
        // Update existing content with proper enum conversion
        await prisma.topicContent.update({
          where: { id: existingContent.id },
          data: {
            contentType: convertContentType(content.contentType), // Convert to proper enum
            url: content.url || null,
            videoUrl: content.videoUrl || null,
            pdfUrl: content.pdfUrl || null,
            textContent: content.textContent || null,
            iframeHtml: content.iframeHtml || null,
            widgetConfig: content.widgetConfig || null,
            updatedAt: new Date(),
          }
        });
      } else {
        // Create new content with generated ID and proper enum
        await prisma.topicContent.create({
          data: {
            id: crypto.randomUUID(),
            topicId: id,
            contentType: convertContentType(content.contentType), // Convert to proper enum
            url: content.url || null,
            videoUrl: content.videoUrl || null,
            pdfUrl: content.pdfUrl || null,
            textContent: content.textContent || null,
            iframeHtml: content.iframeHtml || null,
            widgetConfig: content.widgetConfig || null,
            created_at: new Date(),
            updatedAt: new Date(),
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('id');
    
    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    await prisma.topic.delete({
      where: { id: topicId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
