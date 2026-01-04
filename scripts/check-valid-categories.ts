/**
 * Check what categories exist in the database
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";

async function checkCategories() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('📊 Fetching colleges...');
    const colleges = await College.find({}).lean();

    const categoriesFound = new Set<string>();

    for (const college of colleges) {
      const collegeAny = college as any;
      const branches = college.branchesOffered || collegeAny.branches || [];
      
      for (const branch of branches) {
        const cutoffMap = branch.cutoff;
        if (cutoffMap && typeof cutoffMap === 'object') {
          Object.keys(cutoffMap).forEach(cat => {
            if (cutoffMap[cat] && cutoffMap[cat] > 0) {
              categoriesFound.add(cat);
            }
          });
        }
      }
    }

    console.log('\n✅ Valid Categories in Database:\n');
    const sortedCategories = Array.from(categoriesFound).sort();
    sortedCategories.forEach(cat => {
      console.log(`  - ${cat}`);
    });

    console.log(`\n📊 Total: ${sortedCategories.length} categories`);
    
    console.log('\n⚠️  Note: "general" is NOT a valid category!');
    console.log('Valid categories are: GM, 1G, 1K, 1R, 2AG, 2AK, 2AR, etc.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCategories();
