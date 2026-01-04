import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

async function fixExactDuplicates() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const colleges = await College.find({});
    console.log(`Found ${colleges.length} colleges`);

    let totalDuplicatesRemoved = 0;

    for (const college of colleges) {
      const branchMap = new Map<string, any[]>();
      
      // Group branches by EXACT name (case-insensitive)
      for (const branch of college.branchesOffered) {
        const key = branch.name.trim().toLowerCase();
        if (!branchMap.has(key)) {
          branchMap.set(key, []);
        }
        branchMap.get(key)!.push(branch);
      }

      // Find exact duplicates
      const duplicateGroups = Array.from(branchMap.entries())
        .filter(([_, branches]) => branches.length > 1);

      if (duplicateGroups.length > 0) {
        console.log(`\n${college.name} has ${duplicateGroups.length} exact duplicate groups:`);
        
        const deduplicatedBranches: any[] = [];
        
        for (const [key, branches] of branchMap.entries()) {
          if (branches.length > 1) {
            console.log(`  - "${branches[0].name}" appears ${branches.length} times`);
            
            // Merge all cutoffs - keep the BEST (lowest) cutoff for each category
            const mergedCutoff: any = {};
            
            for (const branch of branches) {
              const cutoffObj = branch.cutoff instanceof Map 
                ? Object.fromEntries(branch.cutoff)
                : branch.cutoff;
              
              for (const [category, value] of Object.entries(cutoffObj)) {
                if (value !== null && value !== undefined) {
                  if (!mergedCutoff[category] || value < mergedCutoff[category]) {
                    mergedCutoff[category] = value;
                  }
                }
              }
            }
            
            console.log(`    → Merged cutoffs: ${Object.keys(mergedCutoff).length} categories`);
            console.log(`    → Sample: 2AG=${mergedCutoff['2AG']}, GM=${mergedCutoff['GM']}`);
            
            // Use the first branch as template
            const firstBranch = branches[0].toObject ? branches[0].toObject() : branches[0];
            const mergedBranch = {
              name: branches[0].name, // Keep original casing
              cutoff: mergedCutoff,
              placementRate: firstBranch.placementRate || 0.7,
              avgSalary: firstBranch.avgSalary || 500000,
              maxSalary: firstBranch.maxSalary || 2000000,
              admissionTrend: firstBranch.admissionTrend || 0.5,
              industryGrowth: firstBranch.industryGrowth || 0.6,
              isBooming: firstBranch.isBooming || false,
              historicalData: firstBranch.historicalData || []
            };
            
            deduplicatedBranches.push(mergedBranch);
            totalDuplicatesRemoved += branches.length - 1;
          } else {
            // No duplicates, convert to plain object
            const branch = branches[0].toObject ? branches[0].toObject() : branches[0];
            const cutoffObj = branch.cutoff instanceof Map 
              ? Object.fromEntries(branch.cutoff)
              : branch.cutoff;
            
            deduplicatedBranches.push({
              name: branch.name,
              cutoff: cutoffObj,
              placementRate: branch.placementRate || 0.7,
              avgSalary: branch.avgSalary || 500000,
              maxSalary: branch.maxSalary || 2000000,
              admissionTrend: branch.admissionTrend || 0.5,
              industryGrowth: branch.industryGrowth || 0.6,
              isBooming: branch.isBooming || false,
              historicalData: branch.historicalData || []
            });
          }
        }
        
        // Update college with deduplicated branches
        college.branchesOffered = deduplicatedBranches;
        await college.save();
        console.log(`  ✓ Updated ${college.name} (${college.branchesOffered.length} branches)`);
      }
    }

    console.log(`\n✅ Deduplication complete!`);
    console.log(`Total duplicates removed: ${totalDuplicatesRemoved}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixExactDuplicates();
