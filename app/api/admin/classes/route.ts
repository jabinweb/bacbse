import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        subjects: {
          select: {
            id: true,
            name: true
          }
        },
        subscriptions: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Transform the data to ensure price is properly formatted
    const transformedClasses = classes.map(cls => ({
      ...cls,
      classId: cls.id, // Add classId as the same as id for form compatibility
      price: cls.price || 29900, // Ensure price is set (in paisa)
    }));

    return NextResponse.json(transformedClasses);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, isActive, price } = await request.json();
    
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        isActive: isActive !== undefined ? isActive : true,
        price: price ? parseInt(price) * 100 : 29900, // Convert to paisa
        currency: 'INR',
        created_at: new Date(),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, isActive, price } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // Build update data object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (price !== undefined) updateData.price = parseInt(price) * 100; // Convert to paisa

    await prisma.class.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    
    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    await prisma.class.delete({
      where: { id: parseInt(classId) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}
