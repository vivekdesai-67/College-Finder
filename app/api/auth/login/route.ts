import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';
import Admin from '@/lib/models/Admin';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, password, userType } = await request.json();

    if (!username || !password || !userType) {
      return NextResponse.json(
        { error: 'Username, password, and user type are required' },
        { status: 400 }
      );
    }

    let user: any;
    if (userType === 'admin') {
      user = await Admin.findOne({ username });
    } else {
      user = await Student.findOne({ username });
    }

    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userId = user._id.toString();
    const token = signToken({ 
      id: userId, 
      username: user.username, 
      role: userType === 'admin' ? 'admin' : 'student' 
    });

    const responseData = {
      token,
      user: {
        id: userId,
        username: user.username,
        email: user.email || null,
        role: userType === 'admin' ? 'admin' as const : 'student' as const,
        profileComplete: user.profileComplete || false
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}