/**
 * Check predictions for rank 1, category 1K, Computer Science
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";

async function checkPredictions() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('📊 Fetching colleges...');
    const colleges = await College.find({}).lean();

    console.log(`✅ Found ${colleges.length} colleges\n`);

    const rank = 1;
    const category = '1K';
    const preferredBranch = 'Computer Science';

    let eligibleCount = 0;
    let totalBranches = 0;

    console.log(`🔍 Checking eligibility for:`);
    console.log(`   Rank: ${rank}`);
    console.log(`   Category: ${category}`);
    console.log(`   Preferred Branch: ${preferredBranch}\n`);

    for (const college of colleges) {
      const collegeAny = college as any;
      const branches = college.branchesOffered || collegeAny.branches || [];
      
      for (const branch of branches) {
        totalBranches++;
        
        // Check if branch name contains "Computer Science"
        const isCSBranch = branch.name.toLowerCase().includes('computer science');
        
        if (!isCSBranch) continue;

        // Check cutoff for category 1K
        const cutoffMap = branch.cutoff;
        if (!cutoffMap) continue;

        const cutoffRank = cutoffMap instanceof Map 
          ? cutoffMap.get(category) 
          : cutoffMap[category];

        if (typeof cutoffRank === 'number' && cutoffRank > 0) {
          // Check if student is eligible (rank <= cutoff)
          if (rank <= cutoffRank) {
            eligibleCount++;
            console.log(`✅ ${college.name}`);
            console.log(`   Branch: ${branch.name}`);
            console.log(`   Cutoff (${category}): ${cutoffRank}`);
            console.log(`   Status: ELIGIBLE\n`);
          }
        }
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Total Colleges: ${colleges.length}`);
    console.log(`   Total Branches: ${totalBranches}`);
    console.log(`   Eligible CS Branches: ${eligibleCount}`);

    if (eligibleCount === 0) {
      console.log(`\n⚠️  No eligible branches found!`);
      console.log(`   Possible reasons:`);
      console.log(`   1. No branches with "Computer Science" in name`);
      console.log(`   2. No cutoff data for category "${category}"`);
      console.log(`   3. All cutoffs are 0 or invalid`);
      
      // Check what categories exist
      console.log(`\n🔍 Checking available categories...`);
      const categoriesFound = new Set<string>();
      const branchNamesFound = new Set<string>();
      
      for (const college of colleges) {
        const collegeAny = college as any;
        const branches = college.branchesOffered || collegeAny.branches || [];
        
        for (const branch of branches) {
          branchNamesFound.add(branch.name);
          const cutoffMap = branch.cutoff;
          if (cutoffMap && typeof cutoffMap === 'object') {
            Object.keys(cutoffMap).forEach(cat => categoriesFound.add(cat));
          }
        }
      }
      
      console.log(`\n   Available Categories: ${Array.from(categoriesFound).join(', ')}`);
      console.log(`\n   Sample Branch Names:`);
      Array.from(branchNamesFound).slice(0, 10).forEach(name => {
        console.log(`     - ${name}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPredictions();
