import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    
    const chapters = await prisma.chapter.findMany({
      where: subjectId ? { subjectId } : {},
      orderBy: { orderIndex: 'asc' }
    });

    return NextResponse.json(chapters || []);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, orderIndex, subjectId } = await request.json();
    
    // Generate a unique ID for the chapter
    const chapterId = crypto.randomUUID();
    
    const newChapter = await prisma.chapter.create({
      data: {
        id: chapterId,
        name,
        orderIndex,
        subjectId,
        created_at: new Date(),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(newChapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, orderIndex } = await request.json();
    
    const updatedChapter = await prisma.chapter.update({
      where: { id },
      data: {
        name,
        orderIndex,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('id');
    
    if (!chapterId) {
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    await prisma.chapter.delete({
      where: { id: chapterId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
