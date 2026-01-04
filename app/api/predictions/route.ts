import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Prediction from "@/lib/models/Prediction";

interface EnhancedPrediction {
  college: string;
  collegeCode: string;
  branch: string;
  category: string;
  predictedCutoff2025: number;
  predictedCutoff2026: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  historicalData: Array<{year: number; rank: number; round: string}>;
  changePercentage: number;
  admissionChance: 'high' | 'medium' | 'low';
}

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const rankParam = searchParams.get("rank");
    const branchesParam = searchParams.get("branches");

    console.log('🔍 Predictions API called with:', { category, rankParam, branchesParam });

    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
    }

    console.log('📊 MongoDB query:', JSON.stringify(query));

    // Fetch predictions from MongoDB
    let predictions = await Prediction.find(query).lean();

    console.log(`📊 Found ${predictions.length} predictions from MongoDB`);

    if (!predictions || predictions.length === 0) {
      console.log('❌ No predictions found');
      return NextResponse.json(
        { error: "No predictions found" },
        { status: 404 }
      );
    }

    // Convert to EnhancedPrediction format
    let enhancedPredictions: EnhancedPrediction[] = predictions.map((pred: any) => ({
      college: pred.college,
      collegeCode: pred.collegeCode,
      branch: pred.branch,
      category: pred.category,
      predictedCutoff2025: pred.predictedCutoff2025,
      predictedCutoff2026: pred.predictedCutoff2026,
      confidence: pred.confidence,
      trend: pred.trend,
      historicalData: pred.historicalData || [],
      changePercentage: pred.changePercentage,
      admissionChance: 'medium' as 'high' | 'medium' | 'low'
    }));

    // Apply filtering if student profile parameters provided
    if (category && rankParam) {
      const rank = parseInt(rankParam, 10);
      
      if (isNaN(rank)) {
        return NextResponse.json(
          { error: "Invalid rank parameter" },
          { status: 400 }
        );
      }

      // Parse preferred branches if provided
      const preferredBranches = branchesParam 
        ? branchesParam.split(",").map(b => b.trim())
        : undefined;

      // Filter by preferred branches if specified
      if (preferredBranches && preferredBranches.length > 0) {
        enhancedPredictions = enhancedPredictions.filter(pred => {
          // Normalize branch names for better matching
          const normalizeBranch = (name: string) => {
            return name
              .toLowerCase()
              .replace(/\s+&\s+/g, ' and ')  // Replace & with and
              .replace(/\s+/g, ' ')           // Normalize spaces
              .replace(/\bai\b/g, 'artificial intelligence')  // Expand AI
              .replace(/\bml\b/g, 'machine learning')         // Expand ML
              .replace(/\bcs\b/g, 'computer')  // CS -> computer
              .replace(/\bec\b/g, 'electronics')  // EC -> electronics
              .replace(/\bee\b/g, 'electrical')  // EE -> electrical
              .replace(/\bme\b/g, 'mechanical')  // ME -> mechanical
              .replace(/\bie\b/g, 'information')  // IE -> information
              .trim();
          };
          
          const normalizedPredBranch = normalizeBranch(pred.branch);
          
          return preferredBranches.some(branch => {
            const normalizedUserBranch = normalizeBranch(branch);
            
            // Check if either contains the other (more flexible matching)
            // Also check for common abbreviations
            const userWords = normalizedUserBranch.split(' ').filter(w => w.length > 2);
            const predWords = normalizedPredBranch.split(' ').filter(w => w.length > 2);
            
            // If any significant word matches, consider it a match
            const hasCommonWord = userWords.some(uw => 
              predWords.some(pw => pw.includes(uw) || uw.includes(pw))
            );
            
            return normalizedPredBranch.includes(normalizedUserBranch) ||
                   normalizedUserBranch.includes(normalizedPredBranch) ||
                   hasCommonWord;
          });
        });
      }

      // Add admission chance based on student rank
      enhancedPredictions = enhancedPredictions.map(pred => ({
        ...pred,
        admissionChance: calculateAdmissionChance(rank, pred.predictedCutoff2026)
      }));

      // Sort by admission chance (high first) and then by predicted cutoff
      enhancedPredictions.sort((a, b) => {
        const chanceOrder = { high: 0, medium: 1, low: 2 };
        const chanceCompare = chanceOrder[a.admissionChance] - chanceOrder[b.admissionChance];
        if (chanceCompare !== 0) return chanceCompare;
        return a.predictedCutoff2026 - b.predictedCutoff2026;
      });
    }

    // Calculate trending summary
    const trendingSummary = calculateEnhancedTrendingSummary(enhancedPredictions);

    // Get historical statistics
    const historicalStats = calculateHistoricalStatsFromPredictions(enhancedPredictions);

    // Return structured response
    return NextResponse.json({
      currentYear: 2025,
      predictedYear: 2026,
      studentProfile: category && rankParam ? {
        rank: parseInt(rankParam, 10),
        category,
        preferredBranches: branchesParam?.split(",").map(b => b.trim()),
      } : null,
      totalColleges: enhancedPredictions.length,
      predictions: enhancedPredictions,
      trendingSummary,
      historicalStats,
      metadata: {
        dataYears: [2022, 2023, 2024],
        predictionYears: [2025, 2026],
        lastUpdated: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}

function calculateAdmissionChance(studentRank: number, cutoffRank: number): 'high' | 'medium' | 'low' {
  const difference = cutoffRank - studentRank;
  const percentDiff = (difference / cutoffRank) * 100;

  if (percentDiff > 20) return 'high';
  if (percentDiff > 0) return 'medium';
  return 'low';
}

function calculateHistoricalStatsFromPredictions(predictions: EnhancedPrediction[]) {
  const uniqueColleges = new Set(predictions.map(p => p.college));
  const uniqueBranches = new Set(predictions.map(p => p.branch));
  const years = new Set<number>();
  const yearRanks: Record<number, number[]> = {};
  
  predictions.forEach(pred => {
    pred.historicalData?.forEach(h => {
      years.add(h.year);
      if (!yearRanks[h.year]) yearRanks[h.year] = [];
      yearRanks[h.year].push(h.rank);
    });
  });
  
  const avgCutoffByYear: Record<number, number> = {};
  for (const [yearStr, ranks] of Object.entries(yearRanks)) {
    const year = parseInt(yearStr);
    avgCutoffByYear[year] = Math.round(
      ranks.reduce((a, b) => a + b, 0) / ranks.length
    );
  }
  
  return {
    totalColleges: uniqueColleges.size,
    totalBranches: uniqueBranches.size,
    yearsCovered: Array.from(years).sort(),
    avgCutoffByYear,
    topBranches: []
  };
}

function calculateEnhancedTrendingSummary(predictions: EnhancedPrediction[]) {
  const branchTrends = new Map<string, { count: number; avgChange: number }>();
  
  for (const pred of predictions) {
    if (!branchTrends.has(pred.branch)) {
      branchTrends.set(pred.branch, { count: 0, avgChange: 0 });
    }
    const trend = branchTrends.get(pred.branch)!;
    trend.count++;
    trend.avgChange += pred.changePercentage;
  }
  
  const branchChanges: Array<{ branch: string; avgChange: number }> = [];
  branchTrends.forEach((data, branch) => {
    branchChanges.push({
      branch,
      avgChange: data.avgChange / data.count
    });
  });
  
  branchChanges.sort((a, b) => b.avgChange - a.avgChange);
  
  const topBoomingBranches = branchChanges
    .filter(b => b.avgChange > 0)
    .slice(0, 5)
    .map(b => b.branch);
  
  const topDecliningBranches = branchChanges
    .filter(b => b.avgChange < 0)
    .slice(-5)
    .reverse()
    .map(b => b.branch);
  
  const averageCutoffChange = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + p.changePercentage, 0) / predictions.length
    : 0;
  
  return {
    topBoomingBranches,
    topDecliningBranches,
    averageCutoffChange
  };
}
