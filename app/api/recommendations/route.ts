// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import College from '@/lib/models/College';
// import Student from '@/lib/models/Student';
// import { verifyToken, getTokenFromRequest } from '@/lib/auth';
// import { getRecommendations, getTrendingBranches } from '@/lib/recommendation';

// export async function GET(request: NextRequest) {
//   try {
//     const token = getTokenFromRequest(request);
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     await connectDB();
    
//     const student = await Student.findById(decoded.id);
//     if (!student) {
//       return NextResponse.json({ error: 'Student not found' }, { status: 404 });
//     }

//     if (!student.rank || !student.category) {
//       return NextResponse.json({ error: 'Profile incomplete' }, { status: 400 });
//     }

//     const colleges = await College.find({}).lean();
    
//     const recommendations = getRecommendations(colleges, {
//       rank: student.rank,
//       category: student.category,
//       preferredBranch: student.preferredBranch
//     });

//     const trendingBranches = getTrendingBranches(colleges);
//     // console.log(recommendations,trendingBranches)

//     return NextResponse.json({
//       recommendations: recommendations.slice(0, 20), // Top 20 recommendations
//       trendingBranches
//     });
//   } catch (error) {
//     console.error('Recommendations error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import College from '@/lib/models/College';
// import Student from '@/lib/models/Student';
// import { verifyToken, getTokenFromRequest } from '@/lib/auth';
// import { getRecommendations, getTrendingBranches, College as CollegeType } from '@/lib/recommendation';

// export async function GET(request: NextRequest) {
//   try {
//     const token = getTokenFromRequest(request);
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     await connectDB();

//     const student = await Student.findById(decoded.id);
//     if (!student) {
//       return NextResponse.json({ error: 'Student not found' }, { status: 404 });
//     }

//     if (!student.rank || !student.category) {
//       return NextResponse.json({ error: 'Profile incomplete' }, { status: 400 });
//     }

//     // 🔹 Convert ObjectId -> string
//     const colleges: CollegeType[] = (await College.find({}).lean()).map((college: any) => ({
//       ...college,
//       _id: college._id.toString(),
//     }));

//     const recommendations = getRecommendations(colleges, {
//       rank: student.rank,
//       category: student.category,
//       preferredBranch: student.preferredBranch,
//     });

//     const trendingBranches = getTrendingBranches(colleges);

//     return NextResponse.json({
//       recommendations: recommendations.slice(0, 20), // Top 20 recommendations
//       trendingBranches,
//     });
//   } catch (error) {
//     console.error('Recommendations error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import College from '@/lib/models/College';
import Student from '@/lib/models/Student';
import { getRecommendations, getTrendingBranches, College as CollegeType } from '@/lib/recommendation';

export async function GET(request: NextRequest) {
  try {
    const authResult = await auth();
    const clerkUserId = authResult.userId;
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const student = await Student.findOne({ clerkId: clerkUserId }).lean();
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!student.rank || !student.category) {
      return NextResponse.json({ error: 'Profile incomplete' }, { status: 400 });
    }

    console.log('=== RECOMMENDATIONS API ===');
    console.log('Student rank:', student.rank);
    console.log('Student category:', student.category);
    console.log('Preferred branches:', student.preferredBranch);

    // Fetch all colleges from database
    const colleges: CollegeType[] = (await College.find({}).lean()).map((college: any) => ({
      ...college,
      _id: college._id.toString(),
    }));

    console.log(`Fetched ${colleges.length} colleges from database`);

    // Use recommendation logic to get personalized recommendations
    const recommendations = getRecommendations(colleges, {
      rank: student.rank,
      category: student.category,
      preferredBranch: student.preferredBranch,
    });

    console.log(`Generated ${recommendations.length} recommendations`);

    // Get trending branches
    const trendingBranches = getTrendingBranches(colleges);

    return NextResponse.json({
      recommendations: recommendations.slice(0, 20), // Top 20 recommendations
      trendingBranches,
      metadata: {
        totalColleges: colleges.length,
        totalRecommendations: recommendations.length,
        returned: Math.min(recommendations.length, 20),
        studentRank: student.rank,
        studentCategory: student.category,
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
