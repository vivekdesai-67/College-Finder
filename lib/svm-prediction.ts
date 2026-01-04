import * as fs from 'fs';
import * as path from 'path';

interface SVMModel {
  model_type: string;
  scaler: {
    mean: number[];
    scale: number[];
  };
  svm: {
    support_vectors: number[][];
    dual_coef: number[][];
    intercept: number[];
    gamma: number;
    kernel: string;
  };
  category_map: { [key: string]: number };
  stats: {
    total_records: number;
    training_samples: number;
    min_rank: number;
    max_rank: number;
    mean_rank: number;
    years: number[];
    num_colleges: number;
    num_branches: number;
    num_categories: number;
  };
  timestamp: string;
}

let cachedModel: SVMModel | null = null;

export function loadSVMModel(): SVMModel {
  if (cachedModel) {
    return cachedModel;
  }

  const modelPath = path.join(process.cwd(), 'data', 'svm-prediction-model.json');
  
  if (!fs.existsSync(modelPath)) {
    throw new Error('SVM model not found. Please run training script first.');
  }

  const modelData = fs.readFileSync(modelPath, 'utf-8');
  cachedModel = JSON.parse(modelData);
  
  return cachedModel!;
}

function rbfKernel(x1: number[], x2: number[], gamma: number): number {
  let sum = 0;
  for (let i = 0; i < x1.length; i++) {
    const diff = x1[i] - x2[i];
    sum += diff * diff;
  }
  return Math.exp(-gamma * sum);
}

function scaleFeatures(features: number[], mean: number[], scale: number[]): number[] {
  return features.map((f, i) => (f - mean[i]) / scale[i]);
}

export function predictRank(
  year: number,
  category: string,
  currentRank: number,
  previousRank?: number
): number {
  const model = loadSVMModel();
  
  // Get category encoding
  const categoryEncoded = model.category_map[category];
  if (categoryEncoded === undefined) {
    throw new Error(`Unknown category: ${category}`);
  }
  
  // Calculate features
  const rankChange = previousRank ? currentRank - previousRank : 0;
  const rankTrend = currentRank > 0 ? rankChange / currentRank : 0;
  const logRank = Math.log1p(currentRank);
  
  const features = [
    year,
    categoryEncoded,
    currentRank,
    rankChange,
    rankTrend,
    logRank
  ];
  
  // Scale features
  const scaledFeatures = scaleFeatures(features, model.scaler.mean, model.scaler.scale);
  
  // SVM prediction using RBF kernel
  let prediction = model.svm.intercept[0];
  
  for (let i = 0; i < model.svm.support_vectors.length; i++) {
    const sv = model.svm.support_vectors[i];
    const coef = model.svm.dual_coef[0][i];
    const kernel_value = rbfKernel(scaledFeatures, sv, model.svm.gamma);
    prediction += coef * kernel_value;
  }
  
  // Ensure prediction is within reasonable bounds
  prediction = Math.max(model.stats.min_rank, Math.min(model.stats.max_rank, prediction));
  
  return Math.round(prediction);
}

export function predictRankForBranch(
  collegeCode: string,
  branch: string,
  category: string,
  historicalRanks: { year: number; rank: number }[]
): { year: number; predictedRank: number; confidence: string }[] {
  const model = loadSVMModel();
  
  if (historicalRanks.length === 0) {
    throw new Error('No historical data provided');
  }
  
  // Sort by year
  historicalRanks.sort((a, b) => a.year - b.year);
  
  const predictions: { year: number; predictedRank: number; confidence: string }[] = [];
  
  // Predict for next 2 years
  const latestYear = historicalRanks[historicalRanks.length - 1].year;
  const latestRank = historicalRanks[historicalRanks.length - 1].rank;
  const previousRank = historicalRanks.length > 1 
    ? historicalRanks[historicalRanks.length - 2].rank 
    : undefined;
  
  for (let i = 1; i <= 2; i++) {
    const targetYear = latestYear + i;
    const predictedRank = predictRank(latestYear, category, latestRank, previousRank);
    
    // Calculate confidence based on data availability
    let confidence = 'medium';
    if (historicalRanks.length >= 3) {
      confidence = 'high';
    } else if (historicalRanks.length === 1) {
      confidence = 'low';
    }
    
    predictions.push({
      year: targetYear,
      predictedRank,
      confidence
    });
  }
  
  return predictions;
}

export function getModelInfo(): {
  modelType: string;
  trainingYears: number[];
  totalRecords: number;
  trainingSamples: number;
  rankRange: { min: number; max: number };
  categories: string[];
} {
  const model = loadSVMModel();
  
  return {
    modelType: model.model_type,
    trainingYears: model.stats.years,
    totalRecords: model.stats.total_records,
    trainingSamples: model.stats.training_samples,
    rankRange: {
      min: model.stats.min_rank,
      max: model.stats.max_rank
    },
    categories: Object.keys(model.category_map)
  };
}

export function batchPredict(
  requests: Array<{
    year: number;
    category: string;
    currentRank: number;
    previousRank?: number;
  }>
): Array<{ predictedRank: number; input: any }> {
  return requests.map(req => ({
    predictedRank: predictRank(req.year, req.category, req.currentRank, req.previousRank),
    input: req
  }));
}
