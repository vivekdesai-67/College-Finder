// Admin route for managing all students
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/roleAuth';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization using role-based auth
    const { userId } = await requireAdmin();

    await connectDB();
    
    // Get all students, excluding password field
    const students = await Student.find({}).select('-password').sort({ createdAt: -1 });

    return NextResponse.json(students);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.error('Students fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}