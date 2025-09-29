// /api/student/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectDB();
    const student = await Student.findById(decoded.id).select('-password'); // Exclude password
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectDB();
    const student = await Student.findById(decoded.id);
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const data = await request.json();
    const { rank, category, preferredBranch } = data;

    // Update fields
    if (rank) student.rank = rank;
    if (category) student.category = category;
    if (preferredBranch) student.preferredBranch = preferredBranch;

    // ✅ Mark profileComplete if all required fields exist
    student.profileComplete = !!(student.rank && student.category && student.preferredBranch);

    await student.save();

    const { password, ...studentData } = student.toObject(); // Exclude password
    return NextResponse.json(studentData);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
