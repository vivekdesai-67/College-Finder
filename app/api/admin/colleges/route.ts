// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import College from '@/lib/models/College';

// export async function GET() {
//   try {
//     await connectDB();
//     const colleges = await College.find();
//     return NextResponse.json(colleges);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB();
//     const data = await request.json();
//     const college = new College(data);
//     await college.save();
//     return NextResponse.json(college, { status: 201 });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Failed to add college' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import College from '@/lib/models/College';
import { verifyToken } from '@/lib/auth'; // function to verify JWT token and admin role

// GET all colleges
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const colleges = await College.find();
    return NextResponse.json({ colleges });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 });
  }
}

// POST - Add a new college
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const admin = await verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const college = new College(data);
    await college.save();
    return NextResponse.json(college, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add college' }, { status: 500 });
  }
}

// PUT - Update an existing college
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const admin = await verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { collegeId, ...updateData } = await request.json();
    const updatedCollege = await College.findByIdAndUpdate(collegeId, updateData, { new: true });
    if (!updatedCollege) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCollege);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update college' }, { status: 500 });
  }
}

// DELETE - Remove a college
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const admin = await verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId is required' }, { status: 400 });
    }

    const deleted = await College.findByIdAndDelete(collegeId);
    if (!deleted) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'College deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete college' }, { status: 500 });
  }
}
