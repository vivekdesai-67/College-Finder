// ML-Based Prediction Engine using Time Series Analysis
// Uses historical data to predict future cutoffs

export interface HistoricalDataPoint {
  year: number;
  cutoff: { [category: string]: number };
  placementRate?: number;
  avgSalary?: number;
  studentsAdmitted?: number;
  studentsPlaced?: number;
}

export interface TrendAnalysis {
  slope: number;              // Rate of change per year
  direction: 'increasing' | 'decreasing' | 'stable';
  confidence: number;         // 0-1, based on R-squared
  volatility: number;         // Standard deviation
}

/**
 * Calculate linear regression for trend analysis
 * Returns slope (rate of change per year)
 */
export function calculateLinearRegression(dataPoints: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = dataPoints.length;
  if (n < 2) {
    return { slope: 0, intercept: dataPoints[0] || 0, rSquared: 0 };
  }

  // X values are years (0, 1, 2, 3, 4 for 5 years)
  const xValues = Array.from({ length: n }, (_, i) => i);
  const yValues = dataPoints;

  // Calculate means
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared (goodness of fit)
  let ssRes = 0; // Sum of squared residuals
  let ssTot = 0; // Total sum of squares

  for (let i = 0; i < n; i++) {
    const predicted = slope * xValues[i] + intercept;
    ssRes += Math.pow(yValues[i] - predicted, 2);
    ssTot += Math.pow(yValues[i] - yMean, 2);
  }

  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

  return { slope, intercept, rSquared };
}

/**
 * Calculate moving average for smoothing
 */
export function calculateMovingAverage(dataPoints: number[], windowSize: number = 3): number {
  if (dataPoints.length === 0) return 0;
  
  const window = dataPoints.slice(-windowSize);
  return window.reduce((sum, val) => sum + val, 0) / window.length;
}

/**
 * Calculate standard deviation (volatility measure)
 */
export function calculateStandardDeviation(dataPoints: number[]): number {
  if (dataPoints.length < 2) return 0;
  
  const mean = dataPoints.reduce((sum, val) => sum + val, 0) / dataPoints.length;
  const squaredDiffs = dataPoints.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / dataPoints.length;
  
  return Math.sqrt(variance);
}

/**
 * Analyze historical trend for a specific category
 */
export function analyzeTrend(historicalData: HistoricalDataPoint[], category: string): TrendAnalysis {
  // Extract cutoff values for the category
  const cutoffValues = historicalData
    .map(data => data.cutoff[category])
    .filter(val => val !== null && val !== undefined);

  if (cutoffValues.length < 2) {
    return {
      slope: 0,
      direction: 'stable',
      confidence: 0,
      volatility: 0,
    };
  }

  // Calculate linear regression
  const { slope, rSquared } = calculateLinearRegression(cutoffValues);
  
  // Calculate volatility
  const volatility = calculateStandardDeviation(cutoffValues);
  
  // Determine direction
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(slope) > 10) { // Significant change threshold
    direction = slope > 0 ? 'increasing' : 'decreasing';
  }

  return {
    slope,
    direction,
    confidence: Math.max(0, Math.min(1, rSquared)), // Clamp between 0 and 1
    volatility,
  };
}

/**
 * Predict next year's cutoff using ML-based approach
 * Combines trend analysis, moving average, and current factors
 */
export function predictCutoffML(
  currentCutoff: number,
  historicalData: HistoricalDataPoint[],
  category: string,
  boomScore: number
): {
  predicted: number;
  confidence: 'high' | 'medium' | 'low';
  method: string;
} {
  // If no historical data, fall back to boom score only
  if (!historicalData || historicalData.length < 2) {
    const adjustment = boomScore >= 0.8 ? 0.8 : boomScore >= 0.6 ? 0.95 : 1.05;
    return {
      predicted: Math.round(currentCutoff * adjustment),
      confidence: 'low',
      method: 'boom-score-only',
    };
  }

  // Extract historical cutoffs for this category
  const cutoffHistory = historicalData
    .map(data => data.cutoff[category])
    .filter(val => val !== null && val !== undefined);

  // Analyze trend
  const trend = analyzeTrend(historicalData, category);
  
  // Method 1: Trend-based prediction (linear extrapolation)
  const trendPrediction = currentCutoff + trend.slope;
  
  // Method 2: Moving average prediction
  const movingAvg = calculateMovingAverage(cutoffHistory, 3);
  const avgPrediction = movingAvg + (currentCutoff - movingAvg) * 0.5; // Weighted towards current
  
  // Method 3: Boom score adjustment
  let boomAdjustment = 1.0;
  if (boomScore >= 0.8) {
    boomAdjustment = 0.75 + (boomScore - 0.8) * 0.5; // 0.75 to 0.85
  } else if (boomScore >= 0.6) {
    boomAdjustment = 0.90 + (boomScore - 0.6) * 0.25; // 0.90 to 0.95
  } else {
    boomAdjustment = 1.05 + (0.6 - boomScore) * 0.0833; // 1.05 to 1.10
  }
  const boomPrediction = currentCutoff * boomAdjustment;

  // Combine predictions with weights based on confidence
  const trendWeight = trend.confidence * 0.5; // 50% max weight for trend
  const avgWeight = 0.3; // 30% weight for moving average
  const boomWeight = 0.2; // 20% weight for boom score
  
  // Normalize weights
  const totalWeight = trendWeight + avgWeight + boomWeight;
  const normalizedTrendWeight = trendWeight / totalWeight;
  const normalizedAvgWeight = avgWeight / totalWeight;
  const normalizedBoomWeight = boomWeight / totalWeight;

  // Final prediction (weighted combination)
  const finalPrediction = 
    (trendPrediction * normalizedTrendWeight) +
    (avgPrediction * normalizedAvgWeight) +
    (boomPrediction * normalizedBoomWeight);

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (trend.confidence >= 0.7 && trend.volatility < 100) {
    confidence = 'high';
  } else if (trend.confidence < 0.4 || trend.volatility > 200) {
    confidence = 'low';
  }

  // Apply bounds (cutoffs shouldn't change too drastically)
  const maxChange = currentCutoff * 0.3; // Max 30% change
  const boundedPrediction = Math.max(
    currentCutoff - maxChange,
    Math.min(currentCutoff + maxChange, finalPrediction)
  );

  return {
    predicted: Math.round(boundedPrediction),
    confidence,
    method: 'ml-hybrid',
  };
}

/**
 * Predict placement rate using historical trend
 */
export function predictPlacementRate(historicalData: HistoricalDataPoint[]): number {
  if (!historicalData || historicalData.length < 2) {
    return 0.7; // Default
  }

  const placementRates = historicalData
    .map(data => data.placementRate)
    .filter(val => val !== null && val !== undefined) as number[];

  if (placementRates.length < 2) {
    return placementRates[0] || 0.7;
  }

  // Use linear regression to predict next year
  const { slope, intercept } = calculateLinearRegression(placementRates);
  const nextYearIndex = placementRates.length;
  const predicted = slope * nextYearIndex + intercept;

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, predicted));
}

/**
 * Predict average salary using historical trend
 */
export function predictAvgSalary(historicalData: HistoricalDataPoint[]): number {
  if (!historicalData || historicalData.length < 2) {
    return 500000; // Default 5 LPA
  }

  const salaries = historicalData
    .map(data => data.avgSalary)
    .filter(val => val !== null && val !== undefined) as number[];

  if (salaries.length < 2) {
    return salaries[0] || 500000;
  }

  // Use linear regression to predict next year
  const { slope, intercept } = calculateLinearRegression(salaries);
  const nextYearIndex = salaries.length;
  const predicted = slope * nextYearIndex + intercept;

  // Ensure reasonable bounds (3 LPA to 50 LPA)
  return Math.max(300000, Math.min(5000000, predicted));
}

/**
 * Generate detailed trend insights for display
 */
export function generateTrendInsights(
  historicalData: HistoricalDataPoint[],
  category: string
): string[] {
  const insights: string[] = [];

  if (!historicalData || historicalData.length < 2) {
    insights.push("Limited historical data available");
    return insights;
  }

  const trend = analyzeTrend(historicalData, category);
  
  // Trend direction insight
  if (trend.direction === 'decreasing') {
    insights.push(`Cutoffs have been decreasing by ~${Math.abs(trend.slope).toFixed(0)} ranks/year (more competitive)`);
  } else if (trend.direction === 'increasing') {
    insights.push(`Cutoffs have been increasing by ~${trend.slope.toFixed(0)} ranks/year (less competitive)`);
  } else {
    insights.push("Cutoffs have remained relatively stable over the years");
  }

  // Confidence insight
  if (trend.confidence >= 0.7) {
    insights.push(`High confidence prediction (${(trend.confidence * 100).toFixed(0)}% accuracy)`);
  } else if (trend.confidence >= 0.4) {
    insights.push(`Moderate confidence prediction (${(trend.confidence * 100).toFixed(0)}% accuracy)`);
  } else {
    insights.push(`Lower confidence due to data variability`);
  }

  // Volatility insight
  if (trend.volatility > 200) {
    insights.push("High year-to-year variation observed");
  } else if (trend.volatility < 50) {
    insights.push("Consistent trend with low variation");
  }

  return insights;
}
