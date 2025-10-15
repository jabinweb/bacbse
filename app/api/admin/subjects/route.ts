import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    
    const subjects = await prisma.subject.findMany({
      where: classId ? { classId: parseInt(classId) } : {},
      orderBy: { orderIndex: 'asc' }
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, icon, color, isLocked, orderIndex, classId, price, currency } = await request.json();
    
    const newSubject = await prisma.subject.create({
      data: {
        name,
        icon,
        color,
        isLocked: isLocked ?? false,
        orderIndex,
        classId,
        price: price || 29900, // Default ₹299 in paisa
        currency: currency || 'INR'
      }
    });

    return NextResponse.json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, icon, color, isLocked, orderIndex, price, currency } = await request.json();
    
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        name,
        icon,
        color,
        isLocked,
        orderIndex,
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency })
      }
    });

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('id');
    
    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    await prisma.subject.delete({
      where: { id: subjectId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
