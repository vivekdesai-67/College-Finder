import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/roleAuth';
import connectDB from '@/lib/mongodb';
import College from '@/lib/models/College';

// GET all colleges (public access)
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

// POST - Add a new college (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization using role-based auth
    const { userId } = await requireAdmin();

    await connectDB();
    const data = await request.json();
    const college = new College(data);
    await college.save();
    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.error('Add college error:', error);
    return NextResponse.json({ error: 'Failed to add college' }, { status: 500 });
  }
}

// PUT - Update an existing college (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization using role-based auth
    const { userId } = await requireAdmin();

    await connectDB();
    const { collegeId, ...updateData } = await request.json();
    const updatedCollege = await College.findByIdAndUpdate(collegeId, updateData, { new: true });
    
    if (!updatedCollege) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCollege);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.error('Update college error:', error);
    return NextResponse.json({ error: 'Failed to update college' }, { status: 500 });
  }
}

// DELETE - Remove a college (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authorization using role-based auth
    const { userId } = await requireAdmin();

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.error('Delete college error:', error);
    return NextResponse.json({ error: 'Failed to delete college' }, { status: 500 });
  }
}
