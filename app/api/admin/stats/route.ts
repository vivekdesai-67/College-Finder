// // File: app/api/admin/stats/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Student from '@/lib/models/Student';
// import College from '@/lib/models/College';

// export async function GET(request: NextRequest) {
//   try {
//     await connectDB();

//     // Total students
//     const totalStudents = await Student.countDocuments();

//     // New students (last 30 days)
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//     const newStudents = await Student.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

//     // Total colleges
//     const totalColleges = await College.countDocuments();

//     // Students grouped by category (for pie chart)
//     const studentsByCategory = await Student.aggregate([
//       { $group: { _id: "$category", count: { $sum: 1 } } }
//     ]);

//     // Mock performance stats (replace later with real monitoring)
//     const performance = {
//       uptime: 99.9,         // %
//       avgResponseTime: 180, // ms
//     };

//     return NextResponse.json({
//       totalStudents,
//       newStudents,
//       totalColleges,
//       studentsByCategory,
//       performance,
//     });
//   } catch (error) {
//     console.error('Stats fetch error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';

export async function GET() {
  try {
    await connectDB();
    const totalUsers = await Student.countDocuments();
    const newUsers = await Student.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } // last 30 days
    });

    const performance = { uptime: 99.9, responseTime: 180 }; // mock performance for now

    return NextResponse.json({ totalUsers, newUsers, performance });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
