/**
 * Debug why predictions are not being generated
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";

async function debugPredictions() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    const colleges = await College.find({}).lean();
    console.log(`✅ Found ${colleges.length} colleges\n`);

    const category = '1K';
    let totalBranches = 0;
    let branchesWithCutoff = 0;
    let branchesWithHistorical = 0;
    let cseBranches = 0;
    let cseWith1K = 0;

    for (const college of colleges) {
      const collegeAny = college as any;
      const branches = college.branchesOffered || collegeAny.branches || [];
      
      for (const branch of branches) {
        totalBranches++;
        
        const isCSE = branch.name.toLowerCase().includes('computer science');
        if (isCSE) cseBranches++;

        // Check if branch has cutoff
        const cutoffMap = branch.cutoff;
        if (cutoffMap && typeof cutoffMap === 'object') {
          const rank1K = cutoffMap instanceof Map 
            ? cutoffMap.get(category) 
            : cutoffMap[category];
          
          if (typeof rank1K === 'number' && rank1K > 0) {
            branchesWithCutoff++;
            if (isCSE) {
              cseWith1K++;
              console.log(`✅ ${college.name} - ${branch.name}`);
              console.log(`   Cutoff (1K): ${rank1K}`);
              console.log(`   Has Historical Data: ${branch.historicalData ? 'YES' : 'NO'}`);
              if (branch.historicalData) {
                console.log(`   Historical Years: ${branch.historicalData.map((h: any) => h.year).join(', ')}`);
                branchesWithHistorical++;
              }
              console.log('');
            }
          }
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total Branches: ${totalBranches}`);
    console.log(`   Branches with Cutoff Data: ${branchesWithCutoff}`);
    console.log(`   Branches with Historical Data: ${branchesWithHistorical}`);
    console.log(`   CSE Branches: ${cseBranches}`);
    console.log(`   CSE with 1K Cutoff: ${cseWith1K}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugPredictions();
