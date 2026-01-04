import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';
import College from '@/lib/models/College';

export async function GET(request: NextRequest) {
  try {
    const authResult = await auth();
    const clerkUserId = authResult.userId;
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const student = await Student.findOne({ clerkId: clerkUserId }).populate('wishlist');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student.wishlist || []);
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth();
    const clerkUserId = authResult.userId;
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collegeId } = await request.json();

    if (!collegeId) {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 });
    }

    await connectDB();
    const student = await Student.findOne({ clerkId: clerkUserId });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const isInWishlist = student.wishlist.includes(collegeId);

    if (isInWishlist) {
      // Remove from wishlist
      student.wishlist = student.wishlist.filter(id => id.toString() !== collegeId);
    } else {
      // Add to wishlist
      student.wishlist.push(collegeId);
    }

    await student.save();

    return NextResponse.json({
      message: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
      wishlist: student.wishlist
    });
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
