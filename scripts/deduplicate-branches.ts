import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

// Normalize branch names for comparison
function normalizeBranchName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+&\s+/g, ' and ')
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content like (CSE)
    .replace(/\s+/g, ' ')
    .trim();
}

// Find the best branch name (prefer shorter, cleaner names)
function selectBestBranchName(names: string[]): string {
  return names.sort((a, b) => {
    // Prefer names without parentheses
    const aHasParens = a.includes('(');
    const bHasParens = b.includes('(');
    if (aHasParens !== bHasParens) {
      return aHasParens ? 1 : -1;
    }
    // Prefer shorter names
    return a.length - b.length;
  })[0];
}

async function deduplicateBranches() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const colleges = await College.find({});
    console.log(`Found ${colleges.length} colleges`);

    let totalDuplicatesRemoved = 0;

    for (const college of colleges) {
      const branchMap = new Map<string, any[]>();
      
      // Group branches by normalized name
      for (const branch of college.branchesOffered) {
        const normalizedName = normalizeBranchName(branch.name);
        if (!branchMap.has(normalizedName)) {
          branchMap.set(normalizedName, []);
        }
        branchMap.get(normalizedName)!.push(branch);
      }

      // Find duplicates
      const duplicateGroups = Array.from(branchMap.entries())
        .filter(([_, branches]) => branches.length > 1);

      if (duplicateGroups.length > 0) {
        console.log(`\n${college.name} has ${duplicateGroups.length} duplicate branch groups:`);
        
        const deduplicatedBranches: any[] = [];
        
        for (const [normalizedName, branches] of branchMap.entries()) {
          if (branches.length > 1) {
            console.log(`  - "${normalizedName}" appears ${branches.length} times:`);
            branches.forEach(b => console.log(`    * ${b.name}`));
            
            // Merge branches - keep the best name and merge cutoffs
            const bestName = selectBestBranchName(branches.map(b => b.name));
            const mergedCutoff: any = {};
            
            // Merge all cutoff categories - handle Map objects
            for (const branch of branches) {
              const cutoffObj = branch.cutoff instanceof Map 
                ? Object.fromEntries(branch.cutoff)
                : branch.cutoff;
              Object.assign(mergedCutoff, cutoffObj);
            }
            
            // Create a plain object for the merged branch
            const firstBranch = branches[0].toObject ? branches[0].toObject() : branches[0];
            const mergedBranch = {
              name: bestName,
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
            
            console.log(`    → Merged into: "${bestName}" with ${Object.keys(mergedCutoff).length} categories`);
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
        console.log(`  ✓ Updated ${college.name}`);
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

deduplicateBranches();
