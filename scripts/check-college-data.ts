import connectDB from "../lib/mongodb";
import College from "../lib/models/College";

async function checkCollegeData() {
  await connectDB();

  console.log('🔍 Checking College Data Structure\n');

  const college: any = await College.findOne({}).lean();
  
  if (!college) {
    console.log('❌ No colleges found!');
    process.exit(1);
  }

  console.log('Sample College:', college.name);
  console.log('\nCollege fields:');
  console.log('  - name:', college.name);
  console.log('  - location:', college.location);
  console.log('  - type:', college.type);
  console.log('  - fees:', college.fees);
  console.log('  - infraRating:', college.infraRating);
  console.log('  - branches count:', college.branchesOffered?.length || 0);

  if (college.branchesOffered && college.branchesOffered.length > 0) {
    const branch = college.branchesOffered[0];
    console.log('\nSample Branch:', branch.name);
    console.log('Branch fields:');
    console.log('  - name:', branch.name);
    console.log('  - cutoff:', branch.cutoff ? 'Yes' : 'No');
    console.log('  - placementRate:', branch.placementRate);
    console.log('  - avgSalary:', branch.avgSalary);
    console.log('  - maxSalary:', branch.maxSalary);
    console.log('  - admissionTrend:', branch.admissionTrend);
    console.log('  - industryGrowth:', branch.industryGrowth);
    console.log('  - isBooming:', branch.isBooming);
    
    console.log('\n❌ PROBLEM FOUND:');
    console.log('The branches are missing boom analysis data!');
    console.log('Required fields: placementRate, avgSalary, maxSalary, admissionTrend, industryGrowth');
    console.log('\nThe recommendation system needs this data to calculate boom percentages.');
  }

  process.exit(0);
}

checkCollegeData();
