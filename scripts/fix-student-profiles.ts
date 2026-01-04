/**
 * Fix corrupted student profiles (nested arrays in preferredBranch)
 */

import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function fixProfiles() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('👥 Fetching all students...');
    const students = await Student.find({}).lean();

    console.log(`✅ Found ${students.length} students\n`);

    let fixed = 0;

    for (const student of students) {
      const studentAny = student as any;
      let needsUpdate = false;
      let fixedBranches: string[] = [];

      if (studentAny.preferredBranch) {
        console.log(`\n📝 Checking ${student.email}:`);
        console.log(`   Current preferredBranch:`, JSON.stringify(studentAny.preferredBranch));

        // Flatten nested arrays and ensure all items are strings
        const flatten = (arr: any): string[] => {
          if (!Array.isArray(arr)) {
            return typeof arr === 'string' ? [arr] : [];
          }
          return arr.flatMap(item => 
            Array.isArray(item) ? flatten(item) : (typeof item === 'string' ? [item] : [])
          );
        };

        fixedBranches = flatten(studentAny.preferredBranch);

        // Check if it needs fixing
        const currentStr = JSON.stringify(studentAny.preferredBranch);
        const fixedStr = JSON.stringify(fixedBranches);

        if (currentStr !== fixedStr) {
          needsUpdate = true;
          console.log(`   ⚠️  Needs fixing!`);
          console.log(`   Fixed preferredBranch:`, JSON.stringify(fixedBranches));
        } else {
          console.log(`   ✅ Already correct`);
        }
      }

      if (needsUpdate) {
        await Student.findByIdAndUpdate(student._id, {
          preferredBranch: fixedBranches
        });
        fixed++;
        console.log(`   ✅ Updated!`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total Students: ${students.length}`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Already Correct: ${students.length - fixed}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProfiles();
