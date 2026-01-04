// Admin route for managing student profiles
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/roleAuth';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization using role-based auth
    const { userId } = await requireAdmin();

    // Get student ID from query params
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    await connectDB();
    const student = await Student.findById(studentId).select('-password');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization using role-based auth
    const { userId } = await requireAdmin();

    const data = await request.json();
    const { studentId, rank, category, preferredBranch } = data;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    await connectDB();
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Update fields
    if (rank !== undefined) student.rank = rank;
    if (category) student.category = category;
    if (preferredBranch) student.preferredBranch = preferredBranch;

    // Mark profileComplete if all required fields exist
    student.profileComplete = !!(student.rank && student.category && student.preferredBranch);

    await student.save();

    const { password, ...studentData } = student.toObject();
    return NextResponse.json(studentData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
