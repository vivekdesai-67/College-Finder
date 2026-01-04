/**
 * Test the getHistoricalCutoffs function logic
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";

interface HistoricalCutoff {
  year: number;
  rank: number;
  round: string;
}

function getHistoricalCutoffs(college: any, branchName: string, category: string = 'GM'): HistoricalCutoff[] {
  const cutoffs: HistoricalCutoff[] = [];
  
  console.log(`\n🔍 Getting historical cutoffs for:`);
  console.log(`   College: ${college.name}`);
  console.log(`   Branch: ${branchName}`);
  console.log(`   Category: ${category}`);
  
  // Check branches for embedded historical data (MongoDB-style)
  const branch = college.branchesOffered?.find((b: any) => b.name === branchName);
  
  if (!branch) {
    console.log(`   ❌ Branch not found`);
    return cutoffs;
  }
  
  console.log(`   ✅ Branch found`);
  console.log(`   Has historicalData: ${!!branch.historicalData}`);
  console.log(`   historicalData length: ${branch.historicalData?.length || 0}`);
  
  if (branch?.historicalData && Array.isArray(branch.historicalData) && branch.historicalData.length > 0) {
    console.log(`   📊 Processing historical data...`);
    for (const historical of branch.historicalData) {
      const cutoffMap = historical.cutoff;
      if (cutoffMap && typeof cutoffMap === 'object') {
        const rank = cutoffMap instanceof Map 
          ? cutoffMap.get(category) 
          : cutoffMap[category];
        
        if (typeof rank === 'number' && rank > 0) {
          cutoffs.push({
            year: historical.year,
            rank: rank,
            round: 'FIRST'
          });
        }
      }
    }
    console.log(`   Found ${cutoffs.length} historical cutoffs`);
  }

  // If no historical data, generate synthetic data based on current cutoff
  if (cutoffs.length === 0 && branch?.cutoff) {
    console.log(`   🔧 Generating synthetic data...`);
    const cutoffMap = branch.cutoff;
    if (cutoffMap && typeof cutoffMap === 'object') {
      const currentRank = cutoffMap instanceof Map 
        ? cutoffMap.get(category) 
        : cutoffMap[category];
      
      console.log(`   Current rank for ${category}: ${currentRank}`);
      
      if (typeof currentRank === 'number' && currentRank > 0) {
        // Generate synthetic historical data for 2022, 2023, 2024
        const years = [2022, 2023, 2024];
        for (const year of years) {
          const yearsFromCurrent = 2024 - year;
          const variation = 1 + (Math.random() * 0.15 - 0.075) * yearsFromCurrent;
          const historicalRank = Math.round(currentRank * variation);
          
          cutoffs.push({
            year,
            rank: Math.max(100, historicalRank),
            round: 'FIRST'
          });
        }
        console.log(`   ✅ Generated ${cutoffs.length} synthetic cutoffs`);
      } else {
        console.log(`   ❌ Current rank is invalid: ${currentRank}`);
      }
    }
  }

  console.log(`   📈 Returning ${cutoffs.length} cutoffs`);
  return cutoffs.sort((a, b) => a.year - b.year);
}

async function testFunction() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    const college = await College.findOne({ name: /UVCE/i }).lean();
    
    if (!college) {
      console.log('❌ College not found');
      process.exit(1);
    }

    const collegeAny = college as any;
    const branches = college.branchesOffered || collegeAny.branches || [];
    const cseBranch = branches.find((b: any) => 
      b.name.toLowerCase().includes('computer science')
    );

    if (!cseBranch) {
      console.log('❌ CSE branch not found');
      process.exit(1);
    }

    const result = getHistoricalCutoffs(college, cseBranch.name, '1K');
    
    console.log(`\n✅ Final Result:`);
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testFunction();
