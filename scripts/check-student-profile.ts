/**
 * Check what's in the student profile
 */

import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function checkProfile() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('👤 Fetching all students...');
    const students = await Student.find({}).lean();

    console.log(`✅ Found ${students.length} students\n`);

    students.forEach((student: any, idx) => {
      console.log(`Student ${idx + 1}:`);
      console.log(`  Name: ${student.name}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Rank: ${student.rank}`);
      console.log(`  Category: ${student.category}`);
      console.log(`  Preferred Branch: ${JSON.stringify(student.preferredBranch)}`);
      console.log(`  Profile Complete: ${student.profileComplete}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProfile();
