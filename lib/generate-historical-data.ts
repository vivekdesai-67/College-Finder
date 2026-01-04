// Helper to generate sample historical data for colleges
// This simulates 5 years of historical cutoff and placement data

export function generateHistoricalData(
  branchName: string,
  currentCutoff: { [category: string]: number },
  currentPlacement: number,
  currentSalary: number
) {
  const historicalData = [];
  const currentYear = 2025;
  
  // Generate data for last 5 years (2020-2024)
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i - 1;
    
    // Simulate trends based on branch type
    let trendFactor = 1.0;
    let placementTrend = 0;
    let salaryTrend = 0;
    
    // CS/AI branches: Increasing demand (cutoffs decreasing = more competitive)
    if (branchName.toLowerCase().includes('computer') || 
        branchName.toLowerCase().includes('ai') ||
        branchName.toLowerCase().includes('data science')) {
      trendFactor = 1 + (i * 0.08); // Cutoffs were higher (less competitive) in past
      placementTrend = -i * 0.03; // Placement improving
      salaryTrend = -i * 50000; // Salary was lower
    }
    // Mechanical/Civil: Stable or slightly declining
    else if (branchName.toLowerCase().includes('mechanical') ||
             branchName.toLowerCase().includes('civil')) {
      trendFactor = 1 + (i * 0.02); // Slight increase in cutoffs (less competitive)
      placementTrend = -i * 0.01;
      salaryTrend = -i * 20000;
    }
    // Electronics: Moderate growth
    else if (branchName.toLowerCase().includes('electronics') ||
             branchName.toLowerCase().includes('electrical')) {
      trendFactor = 1 + (i * 0.05);
      placementTrend = -i * 0.02;
      salaryTrend = -i * 35000;
    }
    // Other branches: Stable
    else {
      trendFactor = 1 + (i * 0.03);
      placementTrend = -i * 0.015;
      salaryTrend = -i * 25000;
    }
    
    // Add some randomness (±5%)
    const randomFactor = 0.95 + Math.random() * 0.1;
    trendFactor *= randomFactor;
    
    // Generate historical cutoffs
    const historicalCutoff: { [category: string]: number } = {};
    for (const [category, value] of Object.entries(currentCutoff)) {
      if (value) {
        // Apply trend factor and round
        historicalCutoff[category] = Math.round(value * trendFactor);
      }
    }
    
    // Generate historical placement and salary
    const historicalPlacement = Math.max(0.3, Math.min(1.0, currentPlacement + placementTrend));
    const historicalSalary = Math.max(300000, currentSalary + salaryTrend);
    
    historicalData.push({
      year,
      cutoff: historicalCutoff,
      placementRate: historicalPlacement,
      avgSalary: historicalSalary,
      studentsAdmitted: Math.floor(60 + Math.random() * 20), // 60-80 students
      studentsPlaced: Math.floor(historicalPlacement * (60 + Math.random() * 20)),
    });
  }
  
  return historicalData;
}

/**
 * Add historical data to existing college branches
 */
export function addHistoricalDataToBranches(branches: any[]) {
  return branches.map(branch => ({
    ...branch,
    historicalData: generateHistoricalData(
      branch.name,
      branch.cutoff,
      branch.placementRate || 0.7,
      branch.avgSalary || 500000
    ),
  }));
}
