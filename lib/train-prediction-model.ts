/**
 * Machine Learning Model Training for KCET Cutoff Predictions
 * Uses historical data from 2022-2023 to train prediction models
 */

interface HistoricalData {
  year: number;
  collegeCode: string;
  collegeName: string;
  branch: string;
  category: string;
  rank: number;
  round: string;
}

interface TrainingFeatures {
  // Temporal features
  yearsSince2022: number;
  
  // College features
  collegePopularity: number; // Based on historical rank trends
  collegeType: number; // Government=1, Private=0
  
  // Branch features
  branchDemand: number; // CS/AI=1, Others scaled
  
  // Category features
  categoryCompetition: number; // GM=1, Others scaled
  
  // Historical trends
  rankTrend: number; // Positive=increasing, Negative=decreasing
  volatility: number; // Standard deviation of ranks
}

interface PredictionModel {
  weights: {
    yearsSince2022: number;
    collegePopularity: number;
    collegeType: number;
    branchDemand: number;
    categoryCompetition: number;
    rankTrend: number;
    volatility: number;
    bias: number;
  };
  metadata: {
    trainedOn: Date;
    dataPoints: number;
    accuracy: number;
  };
}

export class KCETPredictionTrainer {
  private historicalData: HistoricalData[] = [];
  private model: PredictionModel | null = null;

  constructor(data: HistoricalData[]) {
    this.historicalData = data;
  }

  /**
   * Extract features from historical data
   */
  private extractFeatures(data: HistoricalData[]): TrainingFeatures[] {
    const features: TrainingFeatures[] = [];
    
    // Group data by college-branch-category
    const groups = this.groupData(data);
    
    for (const [key, records] of Object.entries(groups)) {
      if (records.length < 2) continue; // Need at least 2 years for trend
      
      records.sort((a, b) => a.year - b.year);
      
      const ranks = records.map(r => r.rank);
      const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
      const rankTrend = this.calculateTrend(ranks);
      const volatility = this.calculateStdDev(ranks);
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        features.push({
          yearsSince2022: record.year - 2022,
          collegePopularity: this.getCollegePopularity(record.collegeName),
          collegeType: this.getCollegeType(record.collegeName),
          branchDemand: this.getBranchDemand(record.branch),
          categoryCompetition: this.getCategoryCompetition(record.category),
          rankTrend,
          volatility: volatility / avgRank, // Normalized volatility
        });
      }
    }
    
    return features;
  }

  /**
   * Group data by college-branch-category combination
   */
  private groupData(data: HistoricalData[]): Record<string, HistoricalData[]> {
    const groups: Record<string, HistoricalData[]> = {};
    
    for (const record of data) {
      const key = `${record.collegeCode}-${record.branch}-${record.category}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    }
    
    return groups;
  }

  /**
   * Calculate linear trend from rank series
   */
  private calculateTrend(ranks: number[]): number {
    if (ranks.length < 2) return 0;
    
    const n = ranks.length;
    const xMean = (n - 1) / 2;
    const yMean = ranks.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (ranks[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Get college popularity score (0-1)
   */
  private getCollegePopularity(collegeName: string): number {
    const topColleges = [
      'University of Visvesvaraya College of Engineering',
      'B M S College of Engineering',
      'R. V. College of Engineering',
      'M S Ramaiah Institute of Technology',
      'P E S University'
    ];
    
    const index = topColleges.findIndex(name => collegeName.includes(name));
    return index >= 0 ? 1 - (index * 0.15) : 0.3;
  }

  /**
   * Get college type (1=Government, 0=Private)
   */
  private getCollegeType(collegeName: string): number {
    return collegeName.toLowerCase().includes('government') ? 1 : 0;
  }

  /**
   * Get branch demand score (0-1)
   */
  private getBranchDemand(branch: string): number {
    const branchLower = branch.toLowerCase();
    
    if (branchLower.includes('computer') || branchLower.includes('cs')) return 1.0;
    if (branchLower.includes('artificial') || branchLower.includes('ai')) return 0.95;
    if (branchLower.includes('information') || branchLower.includes('it')) return 0.9;
    if (branchLower.includes('electronics') || branchLower.includes('ec')) return 0.8;
    if (branchLower.includes('electrical') || branchLower.includes('ee')) return 0.7;
    if (branchLower.includes('mechanical') || branchLower.includes('me')) return 0.6;
    if (branchLower.includes('civil') || branchLower.includes('ce')) return 0.5;
    
    return 0.5;
  }

  /**
   * Get category competition score (0-1)
   */
  private getCategoryCompetition(category: string): number {
    const categoryUpper = category.toUpperCase();
    
    if (categoryUpper === 'GM' || categoryUpper === '1G') return 1.0;
    if (categoryUpper.startsWith('2A')) return 0.85;
    if (categoryUpper.startsWith('2B')) return 0.75;
    if (categoryUpper.startsWith('3A')) return 0.7;
    if (categoryUpper.startsWith('3B')) return 0.65;
    if (categoryUpper.startsWith('SC')) return 0.6;
    if (categoryUpper.startsWith('ST')) return 0.55;
    
    return 0.7;
  }

  /**
   * Train the prediction model using gradient descent
   */
  public train(learningRate: number = 0.001, epochs: number = 1000): PredictionModel {
    const features = this.extractFeatures(this.historicalData);
    const targets = this.historicalData.map(d => d.rank);
    
    // Initialize weights
    const weights = {
      yearsSince2022: 0.1,
      collegePopularity: -0.2,
      collegeType: -0.15,
      branchDemand: -0.25,
      categoryCompetition: -0.2,
      rankTrend: 0.3,
      volatility: 0.1,
      bias: 50000
    };
    
    // Training loop
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const target = targets[i];
        
        // Forward pass
        const prediction = this.predict(feature, weights);
        const error = prediction - target;
        totalError += Math.abs(error);
        
        // Backward pass (gradient descent)
        weights.yearsSince2022 -= learningRate * error * feature.yearsSince2022;
        weights.collegePopularity -= learningRate * error * feature.collegePopularity;
        weights.collegeType -= learningRate * error * feature.collegeType;
        weights.branchDemand -= learningRate * error * feature.branchDemand;
        weights.categoryCompetition -= learningRate * error * feature.categoryCompetition;
        weights.rankTrend -= learningRate * error * feature.rankTrend;
        weights.volatility -= learningRate * error * feature.volatility;
        weights.bias -= learningRate * error;
      }
      
      if (epoch % 100 === 0) {
        console.log(`Epoch ${epoch}: Average Error = ${totalError / features.length}`);
      }
    }
    
    this.model = {
      weights,
      metadata: {
        trainedOn: new Date(),
        dataPoints: features.length,
        accuracy: this.calculateAccuracy(features, targets, weights)
      }
    };
    
    return this.model;
  }

  /**
   * Make prediction using trained weights
   */
  private predict(features: TrainingFeatures, weights: PredictionModel['weights']): number {
    return (
      features.yearsSince2022 * weights.yearsSince2022 +
      features.collegePopularity * weights.collegePopularity +
      features.collegeType * weights.collegeType +
      features.branchDemand * weights.branchDemand +
      features.categoryCompetition * weights.categoryCompetition +
      features.rankTrend * weights.rankTrend +
      features.volatility * weights.volatility +
      weights.bias
    );
  }

  /**
   * Calculate model accuracy
   */
  private calculateAccuracy(
    features: TrainingFeatures[],
    targets: number[],
    weights: PredictionModel['weights']
  ): number {
    let correctPredictions = 0;
    const tolerance = 0.1; // 10% tolerance
    
    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(features[i], weights);
      const target = targets[i];
      const error = Math.abs(prediction - target) / target;
      
      if (error <= tolerance) {
        correctPredictions++;
      }
    }
    
    return correctPredictions / features.length;
  }

  /**
   * Export trained model
   */
  public exportModel(): PredictionModel | null {
    return this.model;
  }
}

// Example usage
export async function trainAndSaveModel(historicalData: HistoricalData[]): Promise<PredictionModel> {
  const trainer = new KCETPredictionTrainer(historicalData);
  const model = trainer.train(0.001, 1000);
  
  console.log('✅ Model trained successfully!');
  console.log(`📊 Accuracy: ${(model.metadata.accuracy * 100).toFixed(2)}%`);
  console.log(`📈 Data points: ${model.metadata.dataPoints}`);
  
  return model;
}
