import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Helper function to verify admin access
async function verifyAdminAccess() {
  const session = await auth();
  if (!session?.user?.email) {
    return { isAuthorized: false, error: 'Not authenticated' };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user || user.role !== 'ADMIN') {
    return { isAuthorized: false, error: 'Not authorized' };
  }

  return { isAuthorized: true, user };
}

export async function GET(request: Request) {
  try {
    // Verify admin access
    const { isAuthorized, error } = await verifyAdminAccess();
    if (!isAuthorized) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    const students = await prisma.user.findMany({
      where: {
        role: 'USER',
        ...(schoolId && { schoolId })
      },
      include: {
        school: {
          select: { name: true }
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          select: { id: true, planName: true, endDate: true }
        },
        progress: {
          where: { completed: true },
          select: { id: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(students || []);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Verify admin access
    const { isAuthorized, error } = await verifyAdminAccess();
    if (!isAuthorized) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { name, email, schoolId, grade, section, rollNumber, phone, parentName, parentEmail } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create new student
    const student = await prisma.user.create({
      data: {
        name,
        email,
        role: 'USER',
        schoolId,
        grade,
        section,
        rollNumber,
        phone,
        parentName,
        parentEmail,
        isActive: true
      },
      include: {
        school: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Verify admin access
    const { isAuthorized, error } = await verifyAdminAccess();
    if (!isAuthorized) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { id, name, email, schoolId, grade, section, rollNumber, phone, parentName, parentEmail, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Update student
    const student = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(schoolId !== undefined && { schoolId }),
        ...(grade !== undefined && { grade }),
        ...(section !== undefined && { section }),
        ...(rollNumber !== undefined && { rollNumber }),
        ...(phone !== undefined && { phone }),
        ...(parentName !== undefined && { parentName }),
        ...(parentEmail !== undefined && { parentEmail }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        school: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Comprehensive user deletion with proper cleanup
    // This handles all related data thanks to Prisma's cascade relationships
    await prisma.$transaction(async (tx) => {
      // 1. Delete user sessions (NextAuth sessions)
      await tx.session.deleteMany({
        where: { userId: studentId }
      });

      // 2. Delete user accounts (OAuth/social login accounts)  
      await tx.account.deleteMany({
        where: { userId: studentId }
      });

      // 3. Delete user-specific data (will cascade to related records)
      // Note: Topic progress, payments, subscriptions, etc. will be deleted automatically
      // due to onDelete: Cascade in the schema
      await tx.user.delete({
        where: { id: studentId }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: 'Student account and all related data deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
