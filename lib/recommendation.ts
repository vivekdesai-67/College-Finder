export interface Branch {
  name: string;
  cutoff: {
    general: number;
    obc: number;
    sc: number;
    st: number;
  };
  placementRate: number;
  avgSalary: number;
  maxSalary: number;
  admissionTrend: number;
  industryGrowth: number;
  isBooming: boolean;
}

export interface Student {
  rank: number;
  category: 'general' | 'obc' | 'sc' | 'st' | '2A' | '2B' | '3A' | '3B';
  preferredBranch?: string;
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
  boomFlag: number;
}

export function calculateBoomFlag(branch: Branch): number {
  const placementComponent = 0.4 * branch.placementRate;
  const salaryComponent = 0.3 * (branch.avgSalary / branch.maxSalary);
  const trendComponent = 0.2 * branch.admissionTrend;
  const industryComponent = 0.1 * branch.industryGrowth;
  
  return Math.min(placementComponent + salaryComponent + trendComponent + industryComponent, 0.8);
}

export function adjustCutoff(originalCutoff: number, boomFlag: number): number {
  // Booming branches have stricter cutoffs (lower rank numbers needed)
  return Math.round(originalCutoff * (1 - boomFlag * 0.3));
}

export function checkEligibility(studentRank: number, adjustedCutoff: number): boolean {
  return studentRank <= adjustedCutoff;
}

export function calculateEligibilityScore(studentRank: number, adjustedCutoff: number): number {
  if (studentRank > adjustedCutoff) return 0;
  
  // Higher score for better ranks relative to cutoff
  const score = Math.max(0, 100 * (1 - studentRank / adjustedCutoff));
  return Math.round(score * 100) / 100;
}

export function getRecommendations(
  colleges: College[], 
  student: Student
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  for (const college of colleges) {
    for (const branch of college.branchesOffered) {
      const boomFlag = calculateBoomFlag(branch);
      const originalCutoff = branch.cutoff[student.category];
      const adjustedCutoff = adjustCutoff(originalCutoff, boomFlag);
      
      if (checkEligibility(student.rank, adjustedCutoff)) {
        const eligibilityScore = calculateEligibilityScore(student.rank, adjustedCutoff);
        
        recommendations.push({
          college,
          branch,
          eligibilityScore,
          adjustedCutoff,
          boomFlag: Math.round(boomFlag * 100)
        });
      }
    }
  }
  
  // Sort by eligibility score (descending) and then by fees (ascending)
  return recommendations.sort((a, b) => {
    if (b.eligibilityScore !== a.eligibilityScore) {
      return b.eligibilityScore - a.eligibilityScore;
    }
    return a.college.fees - b.college.fees;
  });
}

export function getTrendingBranches(colleges: College[]): Branch[] {
  const branchMap = new Map<string, Branch[]>();
  
  // Group branches by name
  colleges.forEach(college => {
    college.branchesOffered.forEach(branch => {
      if (!branchMap.has(branch.name)) {
        branchMap.set(branch.name, []);
      }
      branchMap.get(branch.name)!.push(branch);
    });
  });
  
  // Calculate average boom flag for each branch type
  const trendingBranches: (Branch & { avgBoomFlag: number; collegeCount: number })[] = [];
  
  branchMap.forEach((branches, branchName) => {
    const avgBoomFlag = branches.reduce((sum, branch) => 
      sum + calculateBoomFlag(branch), 0
    ) / branches.length;
    
    // Use the first branch as template, but with calculated boom flag
    const representativeBranch = {
      ...branches[0],
      name: branchName,
      avgBoomFlag,
      collegeCount: branches.length
    };
    
    trendingBranches.push(representativeBranch);
  });
  
  // Sort by boom flag descending
  return trendingBranches
    .sort((a, b) => b.avgBoomFlag - a.avgBoomFlag)
    .slice(0, 6);
}