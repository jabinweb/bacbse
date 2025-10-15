import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Note: This bulk upload functionality has been simplified for NextAuth.js compatibility
// Users must now sign in through OAuth providers (Google) before they can be managed
// This endpoint now only updates existing user profiles, not create new auth accounts

interface ProcessResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: Array<{ row: number; error: string; data: Record<string, string> }>;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const schoolId = formData.get('schoolId') as string;

    if (!file || !schoolId) {
      return NextResponse.json({ error: 'File and school ID are required' }, { status: 400 });
    }

    // Read and parse CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain header and at least one data row' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'email'];
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    const result: ProcessResult = {
      success: true,
      total: lines.length - 1,
      created: 0,
      updated: 0,
      errors: []
    };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const studentData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        studentData[header] = values[index] || '';
      });

      try {
        // Validate required fields
        if (!studentData.name || !studentData.email) {
          result.errors.push({
            row: i + 1,
            error: 'Name and email are required',
            data: studentData
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
          result.errors.push({
            row: i + 1,
            error: 'Invalid email format',
            data: studentData
          });
          continue;
        }

        // Check if user already exists in database (NextAuth.js manages auth, we only update profiles)
        const existingUser = await prisma.user.findUnique({
          where: { email: studentData.email.toLowerCase() },
          select: { id: true }
        });

        if (!existingUser) {
          result.errors.push({
            row: i + 1,
            error: 'User must sign in with Google OAuth first before profile can be updated',
            data: studentData
          });
          continue;
        }

        // Update existing user record with CSV data
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: studentData.name,
            schoolId: schoolId,
            
            // Update profile fields from CSV
            grade: studentData.grade || null,
            section: studentData.section || null,
            rollNumber: studentData.roll_number || null,
            phone: studentData.phone || null,
            parentName: studentData.parent_name || null,
            parentEmail: studentData.parent_email || null,
          }
        });
        
        result.updated++;

      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: studentData
        });
      }
    }

    // Update school student count
    try {
      const schoolUsers = await prisma.user.findMany({
        where: {
          schoolId: schoolId,
          role: 'USER'
        },
        select: { id: true }
      });

      await prisma.school.update({
        where: { id: schoolId },
        data: { studentCount: schoolUsers.length }
      });
    } catch (error) {
      console.error('Error updating school student count:', error);
    }

    // Determine overall success
    result.success = result.errors.length < result.total;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
