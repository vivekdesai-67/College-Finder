import connectDB from "../lib/mongodb";
import College from "../lib/models/College";
import Student from "../lib/models/Student";
import { getRecommendations } from "../lib/recommendation";

async function testRecommendations() {
  await connectDB();

  console.log('🧪 Testing Recommendations System\n');

  // Get the test user
  const student: any = await Student.findOne({ username: "testuser" }).lean();
  
  if (!student) {
    console.log('❌ Test user not found!');
    process.exit(1);
  }

  console.log('Student Profile:');
  console.log('  - Username:', student.username);
  console.log('  - Rank:', student.rank);
  console.log('  - Category:', student.category);
  console.log('  - Preferred Branches:', student.preferredBranch);

  // Get colleges
  const colleges: any[] = (await College.find({}).lean()).map((college: any) => ({
    ...college,
    _id: college._id.toString(),
  }));

  console.log(`\n📊 Found ${colleges.length} colleges`);

  // Prepare student data
  const studentData = {
    rank: student.rank,
    category: student.category,
    preferredBranch: Array.isArray(student.preferredBranch)
      ? student.preferredBranch
      : student.preferredBranch
      ? [student.preferredBranch]
      : [],
  };

  console.log('\nCalling getRecommendations...\n');

  // Get recommendations
  const recommendations = getRecommendations(colleges, studentData);

  console.log(`\n✅ Got ${recommendations.length} recommendations`);

  if (recommendations.length > 0) {
    console.log('\nTop 5 recommendations:');
    recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.college.name}`);
      console.log(`   Branch: ${rec.branch.name}`);
      console.log(`   Eligibility Score: ${rec.eligibilityScore}`);
      console.log(`   Adjusted Cutoff: ${rec.adjustedCutoff}`);
      console.log(`   Boom Percent: ${rec.boomPercent}%`);
    });
  } else {
    console.log('\n❌ No recommendations found!');
    console.log('\nPossible reasons:');
    console.log('1. Student rank is too high (not eligible for any colleges)');
    console.log('2. Category cutoff data is missing');
    console.log('3. Boom analysis is filtering out all colleges');
    
    // Check a sample college
    const sampleCollege = colleges[0];
    if (sampleCollege && sampleCollege.branchesOffered && sampleCollege.branchesOffered.length > 0) {
      const sampleBranch = sampleCollege.branchesOffered[0];
      console.log('\nSample branch cutoff data:');
      console.log('  Branch:', sampleBranch.name);
      console.log('  Cutoffs:', sampleBranch.cutoff);
      console.log('  Student category:', student.category);
      console.log('  Cutoff for student category:', sampleBranch.cutoff[student.category]);
    }
  }

  process.exit(0);
}

testRecommendations();
