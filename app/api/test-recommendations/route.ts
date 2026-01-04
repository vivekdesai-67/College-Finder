import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import College from '@/lib/models/College';
import { getRecommendations, College as CollegeType } from '@/lib/recommendation';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const colleges: CollegeType[] = (await College.find({}).lean()).map((college: any) => ({
      ...college,
      _id: college._id.toString(),
    }));

    // Test with sample student data matching the screenshot
    const studentData = {
      rank: 300,
      category: '2AK',
      preferredBranch: [
        'Computer Science & Engineering',
        'Mechanical Engineering',
        'Information Science & Engineering',
        'Electronics & Communication Engineering'
      ]
    };

    const recommendations = getRecommendations(colleges, studentData);

    // Check cutoff data availability
    const cutoffStats = {
      totalColleges: colleges.length,
      totalBranches: colleges.reduce((sum, c) => sum + c.branchesOffered.length, 0),
      branchesWithCategory2AK: 0,
      branchesWithGM: 0,
      branchesWithAnyCutoff: 0,
    };

    colleges.forEach(college => {
      college.branchesOffered.forEach(branch => {
        if (branch.cutoff['2AK']) cutoffStats.branchesWithCategory2AK++;
        if (branch.cutoff['GM']) cutoffStats.branchesWithGM++;
        if (Object.keys(branch.cutoff).length > 0) cutoffStats.branchesWithAnyCutoff++;
      });
    });

    return NextResponse.json({
      success: true,
      studentData,
      cutoffStats,
      recommendationsCount: recommendations.length,
      sampleRecommendations: recommendations.slice(0, 5).map(r => ({
        college: r.college.name,
        branch: r.branch.name,
        eligibilityScore: r.eligibilityScore,
        adjustedCutoff: r.adjustedCutoff,
        availableCategories: Object.keys(r.branch.cutoff)
      })),
      sampleColleges: colleges.slice(0, 2).map(c => ({
        name: c.name,
        branches: c.branchesOffered.map(b => ({
          name: b.name,
          categories: Object.keys(b.cutoff)
        }))
      }))
    });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
