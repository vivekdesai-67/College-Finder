import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, email, password, address } = await request.json();

    if (!username || !email || !password || !address) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await Student.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Create new student
    const student = new Student({
      username,
      email,
      password,
      address,
      profileComplete: false
    });

    await student.save();

    const token = signToken({ 
      id: student._id, 
      username: student.username, 
      role: 'student' 
    });

    const responseData = {
      token,
      user: {
        id: student._id,
        username: student.username,
        email: student.email,
        role: 'student',
        profileComplete: false
      }
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}