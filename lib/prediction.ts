// Prediction Engine for Tech Boom AI Feature
// Calculates boom scores and predicts next year cutoffs based on branch trends
// Now enhanced with ML-based historical trend analysis

import {
  predictCutoffML,
  predictPlacementRate,
  predictAvgSalary,
  generateTrendInsights,
  HistoricalDataPoint,
} from './ml-prediction';

export interface BranchMetrics {
  placementRate: number;      // 0-1 (e.g., 0.85 = 85%)
  avgSalary: number;           // in rupees
  maxSalary: number;           // in rupees
  admissionTrend: number;      // 0-1 (historical admission demand)
  industryGrowth: number;      // 0-1 (industry demand indicator)
}

export interface BranchPrediction {
  branchName: string;
  currentYear: number;
  predictedYear: number;
  currentCutoff: { [category: string]: number };
  predictedCutoff: { [category: string]: number };
  boomScore: number;           // 0-1
  boomStatus: 'booming' | 'stable' | 'declining';
  adjustmentFactor: number;    // e.g., 0.8 = 20% decrease (more competitive)
  metrics: BranchMetrics;
  reasoning: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface CollegePrediction {
  college: {
    _id: string;
    name: string;
    location: string;
    type: string;
    fees: number;
    infraRating: number;
  };
  branches: BranchPrediction[];
  overallBoomScore: number;
}

/**
 * Calculate boom score based on weighted metrics
 * Formula: (placementRate * 0.30) + (salaryGrowth * 0.30) + (industryGrowth * 0.25) + (admissionTrend * 0.15)
 * 
 * @param metrics - Branch performance metrics
 * @returns Boom score between 0 and 1
 */
export function calculateBoomScore(metrics: BranchMetrics): number {
  // Normalize salary growth (assume baseline avg salary is 5 lakhs)
  const baselineSalary = 500000;
  const salaryGrowth = Math.min((metrics.avgSalary - baselineSalary) / baselineSalary, 1);
  const normalizedSalaryGrowth = Math.max(0, salaryGrowth);

  // Calculate weighted boom score
  const boomScore = 
    (metrics.placementRate * 0.30) +
    (normalizedSalaryGrowth * 0.30) +
    (metrics.industryGrowth * 0.25) +
    (metrics.admissionTrend * 0.15);

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, boomScore));
}

/**
 * Determine boom status based on boom score
 * 
 * @param boomScore - Calculated boom score (0-1)
 * @returns Status classification
 */
export function getBoomStatus(boomScore: number): 'booming' | 'stable' | 'declining' {
  if (boomScore >= 0.8) return 'booming';
  if (boomScore >= 0.6) return 'stable';
  return 'declining';
}

/**
 * Calculate cutoff adjustment factor based on boom score
 * - Booming (>= 0.8): 15-25% decrease (more competitive)
 * - Stable (0.6-0.8): 5-10% decrease (slightly more competitive)
 * - Declining (< 0.6): 5-10% increase (less competitive)
 * 
 * @param boomScore - Calculated boom score (0-1)
 * @returns Adjustment factor to multiply with current cutoff
 */
export function predictCutoffAdjustment(boomScore: number): number {
  if (boomScore >= 0.8) {
    // Booming: 15-25% decrease (factor 0.75-0.85)
    const decreasePercent = 0.15 + (boomScore - 0.8) * 0.5; // scales from 15% to 25%
    return 1 - decreasePercent;
  } else if (boomScore >= 0.6) {
    // Stable: 5-10% decrease (factor 0.90-0.95)
    const decreasePercent = 0.05 + (boomScore - 0.6) * 0.25; // scales from 5% to 10%
    return 1 - decreasePercent;
  } else {
    // Declining: 5-10% increase (factor 1.05-1.10)
    const increasePercent = 0.05 + (0.6 - boomScore) * 0.0833; // scales from 5% to 10%
    return 1 + increasePercent;
  }
}

/**
 * Generate reasoning strings based on metrics
 * 
 * @param metrics - Branch performance metrics
 * @param boomScore - Calculated boom score
 * @returns Array of reasoning strings (top 3 factors)
 */
export function generateReasoning(metrics: BranchMetrics, boomScore: number): string[] {
  const reasons: { text: string; weight: number }[] = [];

  // Placement rate factor
  if (metrics.placementRate >= 0.8) {
    reasons.push({
      text: `High placement rate of ${(metrics.placementRate * 100).toFixed(0)}%`,
      weight: metrics.placementRate * 0.30
    });
  } else if (metrics.placementRate < 0.5) {
    reasons.push({
      text: `Low placement rate of ${(metrics.placementRate * 100).toFixed(0)}%`,
      weight: metrics.placementRate * 0.30
    });
  }

  // Salary factor
  const salaryInLakhs = (metrics.avgSalary / 100000).toFixed(1);
  if (metrics.avgSalary >= 700000) {
    reasons.push({
      text: `Strong average salary of ₹${salaryInLakhs} LPA`,
      weight: 0.30
    });
  } else if (metrics.avgSalary < 400000) {
    reasons.push({
      text: `Below-average salary of ₹${salaryInLakhs} LPA`,
      weight: 0.30
    });
  }

  // Industry growth factor
  if (metrics.industryGrowth >= 0.7) {
    reasons.push({
      text: `High industry demand (${(metrics.industryGrowth * 100).toFixed(0)}% growth indicator)`,
      weight: metrics.industryGrowth * 0.25
    });
  } else if (metrics.industryGrowth < 0.4) {
    reasons.push({
      text: `Declining industry demand (${(metrics.industryGrowth * 100).toFixed(0)}% growth indicator)`,
      weight: metrics.industryGrowth * 0.25
    });
  }

  // Admission trend factor
  if (metrics.admissionTrend >= 0.7) {
    reasons.push({
      text: `Strong student preference (${(metrics.admissionTrend * 100).toFixed(0)}% admission trend)`,
      weight: metrics.admissionTrend * 0.15
    });
  }

  // Sort by weight and return top 3
  reasons.sort((a, b) => b.weight - a.weight);
  return reasons.slice(0, 3).map(r => r.text);
}

/**
 * Determine confidence level based on data completeness
 * 
 * @param metrics - Branch performance metrics
 * @returns Confidence level
 */
export function getConfidenceLevel(metrics: BranchMetrics): 'high' | 'medium' | 'low' {
  // Check if we have realistic data (not just defaults)
  const hasRealisticPlacement = metrics.placementRate !== 0.7;
  const hasRealisticSalary = metrics.avgSalary !== 500000;
  const hasRealisticTrend = metrics.admissionTrend !== 0.5;
  const hasRealisticIndustry = metrics.industryGrowth !== 0.6;

  const dataPoints = [
    hasRealisticPlacement,
    hasRealisticSalary,
    hasRealisticTrend,
    hasRealisticIndustry
  ].filter(Boolean).length;

  if (dataPoints >= 3) return 'high';
  if (dataPoints >= 2) return 'medium';
  return 'low';
}

/**
 * Generate complete branch prediction with current and predicted cutoffs
 * NOW USES ML-BASED PREDICTION with historical data analysis
 * 
 * @param branchData - Branch data from database (with historical data)
 * @param currentYear - Current academic year
 * @returns Complete branch prediction object
 */
export function generateBranchPrediction(
  branchData: {
    name: string;
    cutoff: { [category: string]: number };
    placementRate?: number;
    avgSalary?: number;
    maxSalary?: number;
    admissionTrend?: number;
    industryGrowth?: number;
    historicalData?: HistoricalDataPoint[];
  },
  currentYear: number = 2025
): BranchPrediction {
  // Extract historical data if available
  const historicalData = branchData.historicalData || [];
  
  // Predict future metrics using ML if historical data exists
  const predictedPlacementRate = historicalData.length >= 2 
    ? predictPlacementRate(historicalData)
    : (branchData.placementRate ?? 0.7);
  
  const predictedAvgSalary = historicalData.length >= 2
    ? predictAvgSalary(historicalData)
    : (branchData.avgSalary ?? 500000);

  // Extract current metrics with defaults
  const metrics: BranchMetrics = {
    placementRate: branchData.placementRate ?? 0.7,
    avgSalary: branchData.avgSalary ?? 500000,
    maxSalary: branchData.maxSalary ?? 2000000,
    admissionTrend: branchData.admissionTrend ?? 0.5,
    industryGrowth: branchData.industryGrowth ?? 0.6,
  };

  // Calculate boom score
  const boomScore = calculateBoomScore(metrics);
  
  // Determine boom status
  const boomStatus = getBoomStatus(boomScore);
  
  // Apply ML-based prediction to all category cutoffs
  const predictedCutoff: { [category: string]: number } = {};
  let totalConfidence = 0;
  let confidenceCount = 0;
  
  for (const [category, cutoffValue] of Object.entries(branchData.cutoff)) {
    if (cutoffValue !== null && cutoffValue !== undefined) {
      // Use ML prediction if historical data available
      const mlResult = predictCutoffML(
        cutoffValue,
        historicalData,
        category,
        boomScore
      );
      
      predictedCutoff[category] = mlResult.predicted;
      
      // Track confidence for overall assessment
      const confValue = mlResult.confidence === 'high' ? 1 : mlResult.confidence === 'medium' ? 0.6 : 0.3;
      totalConfidence += confValue;
      confidenceCount++;
    }
  }
  
  // Calculate average adjustment factor (for display)
  const avgCurrentCutoff = Object.values(branchData.cutoff).reduce((sum, val) => sum + (val || 0), 0) / Object.keys(branchData.cutoff).length;
  const avgPredictedCutoff = Object.values(predictedCutoff).reduce((sum, val) => sum + val, 0) / Object.keys(predictedCutoff).length;
  const adjustmentFactor = avgCurrentCutoff > 0 ? avgPredictedCutoff / avgCurrentCutoff : 1;
  
  // Generate reasoning (enhanced with ML insights)
  const reasoning: string[] = [];
  
  // Add ML-based trend insights if available
  if (historicalData.length >= 2) {
    const firstCategory = Object.keys(branchData.cutoff)[0];
    const trendInsights = generateTrendInsights(historicalData, firstCategory);
    reasoning.push(...trendInsights.slice(0, 2)); // Add top 2 insights
  }
  
  // Add traditional boom score reasoning
  const boomReasons = generateReasoning(metrics, boomScore);
  reasoning.push(...boomReasons);
  
  // Limit to top 3 reasons
  const finalReasoning = reasoning.slice(0, 3);
  
  // Determine overall confidence
  const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (avgConfidence >= 0.7) {
    confidence = 'high';
  } else if (avgConfidence < 0.4) {
    confidence = 'low';
  }

  return {
    branchName: branchData.name,
    currentYear,
    predictedYear: currentYear + 1,
    currentCutoff: branchData.cutoff,
    predictedCutoff,
    boomScore,
    boomStatus,
    adjustmentFactor,
    metrics,
    reasoning: finalReasoning,
    confidence,
  };
}

/**
 * Generate predictions for all branches in a college
 * 
 * @param college - College data from database
 * @param currentYear - Current academic year
 * @returns College prediction with all branch predictions
 */
export function generateCollegePrediction(
  college: {
    _id: string;
    name: string;
    location: string;
    type: string;
    fees: number;
    infraRating?: number;
    branchesOffered: Array<{
      name: string;
      cutoff: { [category: string]: number };
      placementRate?: number;
      avgSalary?: number;
      maxSalary?: number;
      admissionTrend?: number;
      industryGrowth?: number;
    }>;
  },
  currentYear: number = 2025
): CollegePrediction {
  // Generate predictions for all branches
  const branchPredictions = college.branchesOffered.map(branch =>
    generateBranchPrediction(branch, currentYear)
  );

  // Calculate overall boom score (average of all branches)
  const overallBoomScore = branchPredictions.length > 0
    ? branchPredictions.reduce((sum, bp) => sum + bp.boomScore, 0) / branchPredictions.length
    : 0;

  return {
    college: {
      _id: college._id.toString(),
      name: college.name,
      location: college.location,
      type: college.type || 'Private',
      fees: college.fees,
      infraRating: college.infraRating ?? 3,
    },
    branches: branchPredictions,
    overallBoomScore,
  };
}

/**
 * Generate predictions for multiple colleges
 * 
 * @param colleges - Array of college data from database
 * @param currentYear - Current academic year
 * @returns Array of college predictions
 */
export function generateCollegePredictions(
  colleges: Array<{
    _id: string;
    name: string;
    location: string;
    type: string;
    fees: number;
    infraRating?: number;
    branchesOffered: Array<{
      name: string;
      cutoff: { [category: string]: number };
      placementRate?: number;
      avgSalary?: number;
      maxSalary?: number;
      admissionTrend?: number;
      industryGrowth?: number;
    }>;
  }>,
  currentYear: number = 2025
): CollegePrediction[] {
  return colleges.map(college => generateCollegePrediction(college, currentYear));
}

/**
 * Filter predictions based on student profile
 * 
 * @param predictions - Array of college predictions
 * @param studentProfile - Student rank, category, and preferred branches
 * @returns Filtered and sorted predictions
 */
export function filterByStudentProfile(
  predictions: CollegePrediction[],
  studentProfile: {
    rank: number;
    category: string;
    preferredBranches?: string[];
  }
): CollegePrediction[] {
  const { rank, category, preferredBranches } = studentProfile;

  // Filter colleges where student is eligible for at least one branch
  const eligiblePredictions = predictions
    .map(collegePred => {
      // Filter branches where student is eligible (rank <= cutoff)
      const eligibleBranches = collegePred.branches.filter(branch => {
        const currentCutoff = branch.currentCutoff[category];
        return currentCutoff !== null && currentCutoff !== undefined && rank <= currentCutoff;
      });

      // If preferred branches specified, prioritize them
      if (preferredBranches && preferredBranches.length > 0) {
        const preferredEligible = eligibleBranches.filter(branch =>
          preferredBranches.some(pref => 
            branch.branchName.toLowerCase().includes(pref.toLowerCase())
          )
        );
        
        // If student has preferred branches that are eligible, show only those
        if (preferredEligible.length > 0) {
          return {
            ...collegePred,
            branches: preferredEligible,
          };
        }
      }

      return {
        ...collegePred,
        branches: eligibleBranches,
      };
    })
    .filter(collegePred => collegePred.branches.length > 0);

  // Sort by overall boom score (descending)
  return eligiblePredictions.sort((a, b) => b.overallBoomScore - a.overallBoomScore);
}

/**
 * Calculate trending summary across all predictions
 * 
 * @param predictions - Array of college predictions
 * @returns Trending summary with top booming/declining branches
 */
export function calculateTrendingSummary(predictions: CollegePrediction[]): {
  topBoomingBranches: string[];
  topDecliningBranches: string[];
  averageCutoffChange: number;
} {
  // Collect all branches with their boom scores
  const branchScores: { [branchName: string]: { scores: number[]; adjustments: number[] } } = {};

  predictions.forEach(collegePred => {
    collegePred.branches.forEach(branch => {
      if (!branchScores[branch.branchName]) {
        branchScores[branch.branchName] = { scores: [], adjustments: [] };
      }
      branchScores[branch.branchName].scores.push(branch.boomScore);
      branchScores[branch.branchName].adjustments.push(branch.adjustmentFactor);
    });
  });

  // Calculate average boom score for each branch
  const branchAverages = Object.entries(branchScores).map(([name, data]) => ({
    name,
    avgBoomScore: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
    avgAdjustment: data.adjustments.reduce((sum, a) => sum + a, 0) / data.adjustments.length,
  }));

  // Sort by boom score
  branchAverages.sort((a, b) => b.avgBoomScore - a.avgBoomScore);

  // Get top 5 booming and declining
  const topBoomingBranches = branchAverages.slice(0, 5).map(b => b.name);
  const topDecliningBranches = branchAverages.slice(-5).reverse().map(b => b.name);

  // Calculate average cutoff change across all branches
  const allAdjustments = branchAverages.map(b => b.avgAdjustment);
  const averageCutoffChange = allAdjustments.length > 0
    ? ((allAdjustments.reduce((sum, a) => sum + a, 0) / allAdjustments.length) - 1) * 100
    : 0;

  return {
    topBoomingBranches,
    topDecliningBranches,
    averageCutoffChange,
  };
}
