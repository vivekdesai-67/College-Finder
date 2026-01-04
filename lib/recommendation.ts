// export interface Branch {
//   name: string;
//   cutoff: {
//     general: number;
//     obc: number;
//     sc: number;
//     st: number;
//   };
//   placementRate: number;
//   avgSalary: number;
//   maxSalary: number;
//   admissionTrend: number;
//   industryGrowth: number;
//   isBooming: boolean;
// }

// export interface Student {
//   rank: number;
//   category: 'general' | 'obc' | 'sc' | 'st' | '2A' | '2B' | '3A' | '3B';
//   preferredBranch?: string;
// }

// export interface College {
//   _id: string;
//   name: string;
//   location: string;
//   fees: number;
//   infraRating: number;
//   branchesOffered: Branch[];
//   type: string;
//   image?: string;
// }

// export interface Recommendation {
//   college: College;
//   branch: Branch;
//   eligibilityScore: number;
//   adjustedCutoff: number;
//   boomFlag: number;
// }

// export function calculateBoomFlag(branch: Branch): number {
//   const placementComponent = 0.4 * branch.placementRate;
//   const salaryComponent = 0.3 * (branch.avgSalary / branch.maxSalary);
//   const trendComponent = 0.2 * branch.admissionTrend;
//   const industryComponent = 0.1 * branch.industryGrowth;
  
//   return Math.min(placementComponent + salaryComponent + trendComponent + industryComponent, 0.8);
// }

// export function adjustCutoff(originalCutoff: number, boomFlag: number): number {
//   // Booming branches have stricter cutoffs (lower rank numbers needed)
//   return Math.round(originalCutoff * (1 - boomFlag * 0.3));
// }

// export function checkEligibility(studentRank: number, adjustedCutoff: number): boolean {
//   return studentRank <= adjustedCutoff;
// }

// export function calculateEligibilityScore(studentRank: number, adjustedCutoff: number): number {
//   if (studentRank > adjustedCutoff) return 0;
  
//   // Higher score for better ranks relative to cutoff
//   const score = Math.max(0, 100 * (1 - studentRank / adjustedCutoff));
//   return Math.round(score * 100) / 100;
// }

// export function getRecommendations(
//   colleges: College[], 
//   student: Student
// ): Recommendation[] {
//   const recommendations: Recommendation[] = [];
  
//   for (const college of colleges) {
//     for (const branch of college.branchesOffered) {
//       const boomFlag = calculateBoomFlag(branch);
//       const originalCutoff = branch.cutoff[student.category];
//       const adjustedCutoff = adjustCutoff(originalCutoff, boomFlag);
      
//       if (checkEligibility(student.rank, adjustedCutoff)) {
//         const eligibilityScore = calculateEligibilityScore(student.rank, adjustedCutoff);
        
//         recommendations.push({
//           college,
//           branch,
//           eligibilityScore,
//           adjustedCutoff,
//           boomFlag: Math.round(boomFlag * 100)
//         });
//       }
//     }
//   }
  
//   // Sort by eligibility score (descending) and then by fees (ascending)
//   return recommendations.sort((a, b) => {
//     if (b.eligibilityScore !== a.eligibilityScore) {
//       return b.eligibilityScore - a.eligibilityScore;
//     }
//     return a.college.fees - b.college.fees;
//   });
// }

// export function getTrendingBranches(colleges: College[]): Branch[] {
//   const branchMap = new Map<string, Branch[]>();
  
//   // Group branches by name
//   colleges.forEach(college => {
//     college.branchesOffered.forEach(branch => {
//       if (!branchMap.has(branch.name)) {
//         branchMap.set(branch.name, []);
//       }
//       branchMap.get(branch.name)!.push(branch);
//     });
//   });
  
//   // Calculate average boom flag for each branch type
//   const trendingBranches: (Branch & { avgBoomFlag: number; collegeCount: number })[] = [];
  
//   branchMap.forEach((branches, branchName) => {
//     const avgBoomFlag = branches.reduce((sum, branch) => 
//       sum + calculateBoomFlag(branch), 0
//     ) / branches.length;
    
//     // Use the first branch as template, but with calculated boom flag
//     const representativeBranch = {
//       ...branches[0],
//       name: branchName,
//       avgBoomFlag,
//       collegeCount: branches.length
//     };
    
//     trendingBranches.push(representativeBranch);
//   });
  
//   // Sort by boom flag descending
//   return trendingBranches
//     .sort((a, b) => b.avgBoomFlag - a.avgBoomFlag)
//     .slice(0, 6);
// }
// ================== INTERFACES ==================

// export interface Branch {
//   name: string;
//    cutoff: {
//     [category: string]: number; // dynamic keys for all categories
//   };
//   placementRate: number;   // 0–1 scale
//   avgSalary: number;
//   maxSalary: number;
//   admissionTrend: number;  // 0–1 scale
//   industryGrowth: number;  // 0–1 scale
//   isBooming: boolean;
// }

// export interface Student {
//   rank: number;
//   category: string;
//   preferredBranch?: string;
// }

// export interface College {
//   _id: string;
//   name: string;
//   location: string;
//   fees: number;
//   infraRating: number;
//   branchesOffered: Branch[];
//   type: string;
//   image?: string;
// }

// export interface Recommendation {
//   college: College;
//   branch: Branch;
//   eligibilityScore: number;
//   adjustedCutoff: number;
//   boomPercent: number;   // 0–100
// }

// export interface TrendingBranch extends Branch {
//   avgBoomFlag: number;   // 0–1
//   collegeCount: number;
// }

// // ================== CORE FUNCTIONS ==================

// // Weighted boom factor calculation
// export function calculateBoomFlag(branch: Branch): number {
//   const placementComponent = 0.4 * branch.placementRate;
//   const salaryComponent = 0.3 * (branch.avgSalary / branch.maxSalary);
//   const trendComponent = 0.2 * branch.admissionTrend;
//   const industryComponent = 0.1 * branch.industryGrowth;

//   // cap at 1.0 (100%)
//   return Math.min(
//     placementComponent + salaryComponent + trendComponent + industryComponent,
//     1
//   );
// }

// // Adjust cutoff based on boom factor
// export function adjustCutoff(originalCutoff: number, boomFlag: number): number {
//   // booming branches have stricter cutoff
//   return Math.round(originalCutoff * (1 - boomFlag * 0.3));
// }

// // Check student eligibility
// export function checkEligibility(studentRank: number, adjustedCutoff: number): boolean {
//   return studentRank <= adjustedCutoff;
// }

// // Smarter eligibility score using sigmoid scaling
// export function calculateEligibilityScore(studentRank: number, adjustedCutoff: number): number {
//   if (studentRank > adjustedCutoff) return 0;

//   const ratio = studentRank / adjustedCutoff; // 0 = perfect, 1 = cutoff
//   const score = 100 / (1 + Math.exp(8 * (ratio - 0.5))); // sigmoid around 0.5

//   return Math.round(score * 100) / 100;
// }

// // ================== RECOMMENDATION ENGINE ==================

// export function getRecommendations(colleges: College[], student: Student): Recommendation[] {
//   const recommendations: Recommendation[] = [];

//   for (const college of colleges) {
//     for (const branch of college.branchesOffered) {
//       const boomFlag = calculateBoomFlag(branch);

//       // ✅ Category cutoff fallback
//       const originalCutoff =
//         branch.cutoff[student.category as keyof typeof branch.cutoff] ??
//         branch.cutoff.general;

//       const adjustedCutoff = adjustCutoff(originalCutoff, boomFlag);

//       if (checkEligibility(student.rank, adjustedCutoff)) {
//         let eligibilityScore = calculateEligibilityScore(student.rank, adjustedCutoff);

//         // ✅ Preferred branch bonus
//         if (
//           student.preferredBranch &&
//           branch.name.toLowerCase() === student.preferredBranch.toLowerCase()
//         ) {
//           eligibilityScore *= 1.1; // 10% boost
//         }

//         recommendations.push({
//           college,
//           branch,
//           eligibilityScore: Math.min(eligibilityScore, 100), // cap at 100
//           adjustedCutoff,
//           boomPercent: Math.round(boomFlag * 100),
//         });
//       }
//     }
//   }

//   // Sort by score desc, then fees asc
//   return recommendations.sort((a, b) => {
//     if (b.eligibilityScore !== a.eligibilityScore) {
//       return b.eligibilityScore - a.eligibilityScore;
//     }
//     return a.college.fees - b.college.fees;
//   });
// }

// // ================== TRENDING BRANCHES ==================

// export function getTrendingBranches(colleges: College[]): TrendingBranch[] {
//   const branchMap = new Map<string, Branch[]>();

//   // group branches by name
//   colleges.forEach(college => {
//     college.branchesOffered.forEach(branch => {
//       if (!branchMap.has(branch.name)) {
//         branchMap.set(branch.name, []);
//       }
//       branchMap.get(branch.name)!.push(branch);
//     });
//   });

//   const trendingBranches: TrendingBranch[] = [];

//   branchMap.forEach((branches, branchName) => {
//     const avgBoomFlag =
//       branches.reduce((sum, branch) => sum + calculateBoomFlag(branch), 0) /
//       branches.length;

//     const representativeBranch: TrendingBranch = {
//       ...branches[0],
//       name: branchName,
//       avgBoomFlag,
//       collegeCount: branches.length,
//     };

//     trendingBranches.push(representativeBranch);
//   });

//   return trendingBranches
//     .sort((a, b) => b.avgBoomFlag - a.avgBoomFlag)
//     .slice(0, 6); // top 6 trending
// }
export interface Branch { 
  name: string;
  cutoff: {
    [category: string]: number; // dynamic keys for all categories
  };
  placementRate: number;   // 0–1 scale
  avgSalary: number;
  maxSalary: number;
  admissionTrend: number;  // 0–1 scale
  industryGrowth: number;  // 0–1 scale
  isBooming: boolean;
}

export interface Student {
  rank: number;
  category: string;
  preferredBranch?: string[]; // ✅ now an array
}

export interface College {
  _id: string;
  name: string;
  location: string;
  fees: number;
  infraRating: number;
  branchesOffered: Branch[];
  type: string;
  image?: string;
}

export interface Recommendation {
  college: College;
  branch: Branch;
  eligibilityScore: number;
  adjustedCutoff: number;
  boomPercent: number;   // 0–100
}

export interface TrendingBranch extends Branch {
  avgBoomFlag: number;   // 0–1
  collegeCount: number;
}

// ================== CORE FUNCTIONS ==================

// Weighted boom factor calculation
export function calculateBoomFlag(branch: Branch): number {
  const placementComponent = 0.4 * branch.placementRate;
  const salaryComponent = 0.3 * (branch.avgSalary / branch.maxSalary);
  const trendComponent = 0.2 * branch.admissionTrend;
  const industryComponent = 0.1 * branch.industryGrowth;

  return Math.min(
    placementComponent + salaryComponent + trendComponent + industryComponent,
    1
  );
}

// Adjust cutoff based on boom factor
export function adjustCutoff(originalCutoff: number, boomFlag: number): number {
  return Math.round(originalCutoff * (1 - boomFlag * 0.3));
}

// Check student eligibility
export function checkEligibility(studentRank: number, adjustedCutoff: number): boolean {
  return studentRank <= adjustedCutoff;
}

// Smarter eligibility score using sigmoid scaling
export function calculateEligibilityScore(studentRank: number, adjustedCutoff: number): number {
  if (studentRank > adjustedCutoff) return 0;

  const ratio = studentRank / adjustedCutoff; // 0 = perfect, 1 = cutoff
  const score = 100 / (1 + Math.exp(8 * (ratio - 0.5))); // sigmoid around 0.5

  return Math.round(score * 100) / 100;
}

// ================== RECOMMENDATION ENGINE ==================
export function getRecommendations(colleges: College[], student: Student): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  console.log('=== RECOMMENDATION DEBUG ===');
  console.log('Student rank:', student.rank);
  console.log('Student category:', student.category);
  console.log('Student preferred branches:', student.preferredBranch);

  // Normalize preferred branches to flat array of lowercase strings
  const preferredBranches: string[] = Array.isArray(student.preferredBranch)
    ? student.preferredBranch.flat().filter(pb => typeof pb === 'string').map(pb => pb.toLowerCase())
    : [];
  
  const hasPreferredBranches = preferredBranches.length > 0;
  console.log('Normalized preferred branches:', preferredBranches);
  console.log('Has preferred branches:', hasPreferredBranches);

  for (const college of colleges) {
    for (const branch of college.branchesOffered) {
      // ✅ FILTER: Only include branches that match user's preferred branches
      if (hasPreferredBranches) {
        const branchNameLower = branch.name.toLowerCase();
        
        // Normalize branch name for better matching
        const normalizeBranchName = (name: string) => {
          return name
            .toLowerCase()
            .replace(/\s+&\s+/g, ' ')
            .replace(/\s+and\s+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };
        
        const normalizedBranchName = normalizeBranchName(branch.name);
        
        const isPreferred = preferredBranches.some(pb => {
          const normalizedPreferred = normalizeBranchName(pb);
          
          // Check for various matching patterns
          const exactMatch = normalizedBranchName === normalizedPreferred;
          const containsMatch = normalizedBranchName.includes(normalizedPreferred) || normalizedPreferred.includes(normalizedBranchName);
          
          // Check for keyword matches (e.g., "computer" matches "computer science engineering")
          const keywords = normalizedPreferred.split(' ').filter(w => w.length > 3);
          const keywordMatch = keywords.length > 0 && keywords.every(kw => normalizedBranchName.includes(kw));
          
          const matches = exactMatch || containsMatch || keywordMatch;
          
          if (matches && recommendations.length < 10) {
            console.log(`✅ Branch "${branch.name}" matches preferred "${pb}" (normalized: "${normalizedBranchName}" vs "${normalizedPreferred}")`);
          }
          
          return matches;
        });
        
        if (!isPreferred) {
          continue; // Skip this branch if it's not in preferred list
        }
      }
      
      const boomFlag = calculateBoomFlag(branch);

      // Category cutoff fallback - try multiple fallbacks
      let originalCutoff = branch.cutoff[student.category as keyof typeof branch.cutoff];
      
      // If category not found, try similar categories or GM
      if (!originalCutoff || originalCutoff === 0) {
        // Try GM (General Merit) as fallback
        originalCutoff = branch.cutoff['GM'] || branch.cutoff['GMK'] || branch.cutoff['GMR'];
      }
      
      // If still not found, try any available category
      if (!originalCutoff || originalCutoff === 0) {
        const availableCutoffs = Object.values(branch.cutoff).filter(c => c && c > 0);
        if (availableCutoffs.length > 0) {
          originalCutoff = Math.min(...availableCutoffs); // Use the most competitive cutoff
        } else {
          originalCutoff = 100000; // Default high number
        }
      }

      const adjustedCutoff = adjustCutoff(originalCutoff, boomFlag);
      
      const isEligible = checkEligibility(student.rank, adjustedCutoff);
      
      // Debug logging for first few branches
      if (recommendations.length < 3) {
        console.log(`Branch: ${branch.name}, Original cutoff: ${originalCutoff}, Adjusted: ${adjustedCutoff}, Eligible: ${isEligible}, Student rank: ${student.rank}`);
        console.log(`Available categories:`, Object.keys(branch.cutoff));
      }

      if (isEligible) {
        let eligibilityScore = calculateEligibilityScore(student.rank, adjustedCutoff);

        // Give a small boost to preferred branches (they're already filtered)
        if (hasPreferredBranches) {
          eligibilityScore *= 1.05; // 5% boost for being a preferred branch
        }

        recommendations.push({
          college,
          branch,
          eligibilityScore: Math.min(eligibilityScore, 100),
          adjustedCutoff,
          boomPercent: Math.round(boomFlag * 100),
        });
      }
    }
  }
  
  console.log('Total eligible recommendations:', recommendations.length);
  if (recommendations.length > 0) {
    console.log('Sample recommendation:', {
      college: recommendations[0].college.name,
      branch: recommendations[0].branch.name,
      eligibilityScore: recommendations[0].eligibilityScore
    });
  }
  
  // Sort by score desc, then fees asc
  return recommendations.sort((a, b) => {
    if (b.eligibilityScore !== a.eligibilityScore) {
      return b.eligibilityScore - a.eligibilityScore;
    }
    return a.college.fees - b.college.fees;
  });
}

// ================== TRENDING BRANCHES ==================
export function getTrendingBranches(colleges: College[]): TrendingBranch[] {
  const branchMap = new Map<string, Branch[]>();

  // group branches by name
  colleges.forEach(college => {
    college.branchesOffered.forEach(branch => {
      if (!branchMap.has(branch.name)) {
        branchMap.set(branch.name, []);
      }
      branchMap.get(branch.name)!.push(branch);
    });
  });

  const trendingBranches: TrendingBranch[] = [];

  branchMap.forEach((branches, branchName) => {
    const avgBoomFlag =
      branches.reduce((sum, branch) => sum + calculateBoomFlag(branch), 0) /
      branches.length;

    const representativeBranch: TrendingBranch = {
      ...branches[0],
      name: branchName,
      avgBoomFlag,
      collegeCount: branches.length,
    };

    trendingBranches.push(representativeBranch);
  });

  return trendingBranches
    .sort((a, b) => b.avgBoomFlag - a.avgBoomFlag)
    .slice(0, 6); // top 6 trending
}
