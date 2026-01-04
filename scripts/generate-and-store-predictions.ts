/**
 * Generate predictions for all colleges and store in MongoDB
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";
import Prediction from "../lib/models/Prediction";

interface HistoricalCutoff {
  year: number;
  rank: number;
  round: string;
}

function getHistoricalCutoffs(college: any, branchName: string, category: string): HistoricalCutoff[] {
  const cutoffs: HistoricalCutoff[] = [];
  
  const branch = college.branchesOffered?.find((b: any) => b.name === branchName);
  if (!branch) return cutoffs;
  
  // Get historical data
  if (branch.historicalData && Array.isArray(branch.historicalData) && branch.historicalData.length > 0) {
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
  }
  
  // If no historical data, generate synthetic data
  if (cutoffs.length === 0 && branch.cutoff) {
    const cutoffMap = branch.cutoff;
    if (cutoffMap && typeof cutoffMap === 'object') {
      const currentRank = cutoffMap instanceof Map 
        ? cutoffMap.get(category) 
        : cutoffMap[category];
      
      if (typeof currentRank === 'number' && currentRank > 0) {
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
      }
    }
  }
  
  return cutoffs.sort((a, b) => a.year - b.year);
}

function predictCutoffForYear(historicalData: HistoricalCutoff[], targetYear: number): number {
  if (historicalData.length === 0) return 50000;
  
  const sorted = [...historicalData].sort((a, b) => a.year - b.year);
  
  if (sorted.length === 1) {
    const yearsAhead = targetYear - sorted[0].year;
    const variation = 1 + (Math.random() * 0.03 - 0.015);
    return Math.round(sorted[0].rank * Math.pow(variation, yearsAhead));
  }
  
  // Linear regression
  const n = sorted.length;
  const sumX = sorted.reduce((sum, d) => sum + d.year, 0);
  const sumY = sorted.reduce((sum, d) => sum + d.rank, 0);
  const sumXY = sorted.reduce((sum, d) => sum + d.year * d.rank, 0);
  const sumX2 = sorted.reduce((sum, d) => sum + d.year * d.year, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const prediction = slope * targetYear + intercept;
  
  return Math.max(1, Math.min(300000, Math.round(prediction)));
}

function calculateTrend(historicalData: HistoricalCutoff[]): 'increasing' | 'decreasing' | 'stable' {
  if (historicalData.length < 2) return 'stable';
  
  const sorted = [...historicalData].sort((a, b) => a.year - b.year);
  const firstRank = sorted[0].rank;
  const lastRank = sorted[sorted.length - 1].rank;
  
  const change = ((lastRank - firstRank) / firstRank) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
}

function calculateConfidence(historicalData: HistoricalCutoff[]): number {
  if (historicalData.length === 0) return 0;
  if (historicalData.length === 1) return 50;
  if (historicalData.length === 2) return 70;
  
  const ranks = historicalData.map(d => d.rank);
  const mean = ranks.reduce((a, b) => a + b, 0) / ranks.length;
  const variance = ranks.reduce((sum, rank) => sum + Math.pow(rank - mean, 2), 0) / ranks.length;
  const stdDev = Math.sqrt(variance);
  
  const coefficientOfVariation = stdDev / mean;
  const confidence = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
  const dataBonus = Math.min(20, historicalData.length * 5);
  
  return Math.min(100, Math.round(confidence + dataBonus));
}

async function generatePredictions() {
  try {
    console.log('🚀 Generating and Storing Predictions\n');
    console.log('='.repeat(70));
    
    await connectDB();
    
    // Clear existing predictions
    console.log('\n🗑️  Clearing existing predictions...');
    await Prediction.deleteMany({});
    console.log('   ✅ Cleared');
    
    // Fetch all colleges
    console.log('\n📊 Fetching colleges...');
    const colleges = await College.find({}).lean();
    console.log(`   ✅ Found ${colleges.length} colleges`);
    
    const categories = ['GM', '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR', '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR'];
    
    console.log('\n💾 Generating predictions...');
    
    const predictions = [];
    let processed = 0;
    
    for (const college of colleges) {
      const branches = college.branchesOffered || [];
      if (branches.length === 0) continue;
      
      for (const branch of branches) {
        for (const category of categories) {
          try {
            const historicalData = getHistoricalCutoffs(college, branch.name, category);
            
            if (historicalData.length === 0) continue;
            
            const prediction2025 = predictCutoffForYear(historicalData, 2025);
            const prediction2026 = predictCutoffForYear(historicalData, 2026);
            const trend = calculateTrend(historicalData);
            const confidence = calculateConfidence(historicalData);
            
            const latestRank = historicalData[historicalData.length - 1]?.rank || prediction2025;
            const changePercentage = ((prediction2026 - latestRank) / latestRank) * 100;
            
            predictions.push({
              college: college.name,
              collegeCode: college.code || college._id?.toString() || '',
              branch: branch.name,
              category: category,
              predictedCutoff2025: prediction2025,
              predictedCutoff2026: prediction2026,
              confidence: confidence,
              trend: trend,
              historicalData: historicalData,
              changePercentage: Math.round(changePercentage * 10) / 10,
            });
          } catch (error) {
            console.error(`Error for ${college.name} - ${branch.name} - ${category}:`, error);
          }
        }
      }
      
      processed++;
      if (processed % 50 === 0) {
        console.log(`   Progress: ${processed}/${colleges.length} colleges processed...`);
      }
    }
    
    console.log(`\n💾 Storing ${predictions.length} predictions in MongoDB...`);
    
    // Batch insert for better performance
    const batchSize = 1000;
    for (let i = 0; i < predictions.length; i += batchSize) {
      const batch = predictions.slice(i, i + batchSize);
      await Prediction.insertMany(batch);
      console.log(`   Inserted ${Math.min(i + batchSize, predictions.length)}/${predictions.length} predictions...`);
    }
    
    console.log('\n✅ Generation Complete!');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Predictions: ${predictions.length}`);
    console.log(`   Colleges Processed: ${processed}`);
    console.log(`   Categories: ${categories.length}`);
    
    // Verify
    const count = await Prediction.countDocuments();
    console.log(`\n🔍 Verification:`);
    console.log(`   Predictions in MongoDB: ${count}`);
    
    // Sample prediction
    const sample: any = await Prediction.findOne({ category: '1K', branch: /Computer Science/i }).lean();
    if (sample) {
      console.log(`\n   Sample Prediction:`);
      console.log(`   College: ${sample.college}`);
      console.log(`   Branch: ${sample.branch}`);
      console.log(`   Category: ${sample.category}`);
      console.log(`   2025 Prediction: ${sample.predictedCutoff2025}`);
      console.log(`   2026 Prediction: ${sample.predictedCutoff2026}`);
      console.log(`   Trend: ${sample.trend}`);
    }
    
    console.log('\n🎉 All predictions stored! The API will now be much faster.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generatePredictions();
