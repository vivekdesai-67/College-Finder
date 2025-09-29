
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import College from '@/lib/models/College'; // 👈 ensure College is registered
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import mongoose from "mongoose";


export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    // console.log("Registered models:", Object.keys(mongoose.models));
    const student = await Student.findById(decoded.id).populate('wishlist');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: student._id,
      username: student.username,
      email: student.email,
      address: student.address,
      rank: student.rank,
      category: student.category,
      preferredBranch: student.preferredBranch,
      profileComplete: student.profileComplete,
      wishlist: student.wishlist || []
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { rank, category, preferredBranch } = await request.json();

    const rankNum = Number(rank);
    if (rank === undefined || isNaN(rankNum) || !category || !preferredBranch) {
      return NextResponse.json(
        { error: 'Rank (number), category, and preferred branch are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const student = await Student.findByIdAndUpdate(
      decoded.id,
      {
        rank: rankNum,
        category,
        preferredBranch,
        profileComplete: true
      },
      { new: true }
    ).populate('wishlist');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: student._id,
      username: student.username,
      email: student.email,
      address: student.address,
      rank: student.rank,
      category: student.category,
      preferredBranch: student.preferredBranch,
      profileComplete: student.profileComplete,
      wishlist: student.wishlist || []
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
