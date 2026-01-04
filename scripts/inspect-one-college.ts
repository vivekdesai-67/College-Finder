/**
 * Inspect one college in detail
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";

async function inspectCollege() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    const college = await College.findOne({ name: /UVCE/i }).lean();
    
    if (!college) {
      console.log('❌ College not found');
      process.exit(1);
    }

    console.log(`\n🏫 College: ${college.name}\n`);

    const collegeAny = college as any;
    const branches = college.branchesOffered || collegeAny.branches || [];

    const cseBranch = branches.find((b: any) => 
      b.name.toLowerCase().includes('computer science')
    );

    if (!cseBranch) {
      console.log('❌ CSE branch not found');
      process.exit(1);
    }

    console.log(`📚 Branch: ${cseBranch.name}\n`);
    console.log(`📊 Cutoff Data:`);
    console.log(JSON.stringify(cseBranch.cutoff, null, 2));
    
    console.log(`\n📈 Historical Data:`);
    if (cseBranch.historicalData) {
      console.log(`   Array Length: ${cseBranch.historicalData.length}`);
      console.log(`   Data:`, JSON.stringify(cseBranch.historicalData, null, 2));
    } else {
      console.log(`   NO HISTORICAL DATA`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inspectCollege();
