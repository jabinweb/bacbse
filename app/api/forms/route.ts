import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FormType, FormResponseStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formType, name, email, phone, subject, message, metadata } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Create form response
    const formResponse = await prisma.formResponse.create({
      data: {
        formType: formType || 'CONTACT',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        metadata: metadata || {},
        status: 'UNREAD',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      data: {
        id: formResponse.id,
        submittedAt: formResponse.created_at,
      },
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to submit form. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error : undefined 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get('formType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: { formType?: FormType; status?: FormResponseStatus } = {};
    if (formType && Object.values(FormType).includes(formType as FormType)) {
      where.formType = formType as FormType;
    }
    if (status && Object.values(FormResponseStatus).includes(status as FormResponseStatus)) {
      where.status = status as FormResponseStatus;
    }

    // Get form responses with pagination
    const [responses, total] = await Promise.all([
      prisma.formResponse.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.formResponse.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: responses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching form responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form responses' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, metadata } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Form response ID is required' },
        { status: 400 }
      );
    }

    const updateData: { status?: FormResponseStatus; metadata?: object } = {};
    if (status && Object.values(FormResponseStatus).includes(status as FormResponseStatus)) {
      updateData.status = status as FormResponseStatus;
    }
    if (metadata) {
      updateData.metadata = metadata;
    }

    const updatedResponse = await prisma.formResponse.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedResponse,
    });

  } catch (error) {
    console.error('Error updating form response:', error);
    return NextResponse.json(
      { error: 'Failed to update form response' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Form response ID is required' },
        { status: 400 }
      );
    }

    await prisma.formResponse.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Form response deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting form response:', error);
    return NextResponse.json(
      { error: 'Failed to delete form response' },
      { status: 500 }
    );
  }
}