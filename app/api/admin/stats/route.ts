import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/roleAuth';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';

export async function GET() {
  try {
    // Check admin authorization using privateMetadata
    const { userId } = await requireAdmin();

    await connectDB();
    const totalUsers = await Student.countDocuments();
    const newUsers = await Student.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } // last 30 days
    });

    const performance = { uptime: 99.9, responseTime: 180 }; // mock performance for now

    return NextResponse.json({ totalUsers, newUsers, performance });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
}