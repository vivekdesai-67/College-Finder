import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

interface CutoffRecord {
  year: number;
  collegeCode: string;
  collegeName: string;
  branch: string;
  category: string;
  rank: number;
}

interface TrainingData {
  features: number[][];
  labels: number[];
  metadata: {
    collegeCode: string;
    branch: string;
    category: string;
  }[];
}

// Category mapping for encoding
const categoryMap: { [key: string]: number } = {
  '1G': 0, '1K': 1, '1R': 2,
  '2AG': 3, '2AK': 4, '2AR': 5,
  '2BG': 6, '2BK': 7, '2BR': 8,
  '3AG': 9, '3AK': 10, '3AR': 11,
  '3BG': 12, '3BK': 13, '3BR': 14,
  'GM': 15, 'GMK': 16, 'GMR': 17,
  'SCG': 18, 'SCK': 19, 'SCR': 20,
  'STG': 21, 'STK': 22, 'STR': 23
};

function parseCSVFile(filePath: string, year: number): CutoffRecord[] {
  console.log(`\nParsing ${path.basename(filePath)} for year ${year}...`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const records: CutoffRecord[] = [];
  let currentCollege = '';
  let currentCollegeCode = '';
  let categories: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Parse college info
    if (line.includes('College:') || line.match(/^\d+,E\d+/)) {
      const parts = line.split(',');
      if (parts.length > 2) {
        currentCollegeCode = parts[1]?.trim() || '';
        currentCollege = parts[2]?.trim() || '';
      }
      continue;
    }
    
    // Parse category headers
    if (line.includes('1G') && line.includes('GM')) {
      categories = line.split(',').map(c => c.trim()).filter(c => c);
      continue;
    }
    
    // Parse branch data
    if (currentCollege && categories.length > 0) {
      const parts = line.split(',');
      if (parts.length > 3) {
        const branchName = parts[0]?.trim() + ' ' + parts[1]?.trim();
        
        // Skip if not a valid branch
        if (!branchName || branchName.length < 3) continue;
        
        // Parse ranks for each category
        for (let j = 2; j < Math.min(parts.length, categories.length + 2); j++) {
          const rankStr = parts[j]?.trim().replace(/--/g, '').replace(/\s+/g, '');
          if (rankStr && rankStr !== '' && !isNaN(Number(rankStr))) {
            const rank = parseInt(rankStr);
            const category = categories[j - 2];
            
            if (rank > 0 && category) {
              records.push({
                year,
                collegeCode: currentCollegeCode,
                collegeName: currentCollege,
                branch: branchName,
                category,
                rank
              });
            }
          }
        }
      }
    }
  }
  
  console.log(`  Extracted ${records.length} records`);
  return records;
}

function prepareTrainingData(records: CutoffRecord[]): TrainingData {
  console.log('\nPreparing training data...');
  
  // Group by college, branch, and category
  const grouped = new Map<string, CutoffRecord[]>();
  
  for (const record of records) {
    const key = `${record.collegeCode}|${record.branch}|${record.category}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(record);
  }
  
  const features: number[][] = [];
  const labels: number[] = [];
  const metadata: { collegeCode: string; branch: string; category: string }[] = [];
  
  // Create training samples
  for (const [key, records] of Array.from(grouped.entries())) {
    // Sort by year
    records.sort((a: CutoffRecord, b: CutoffRecord) => a.year - b.year);
    
    // Need at least 2 years of data to create a training sample
    if (records.length >= 2) {
      const [collegeCode, branch, category] = key.split('|');
      
      // Create features from historical data
      for (let i = 0; i < records.length - 1; i++) {
        const feature = [
          records[i].year,                    // Year
          categoryMap[category] || 0,         // Category encoded
          records[i].rank,                    // Current year rank
          i > 0 ? records[i].rank - records[i-1].rank : 0, // Rank change
          records[i].rank / 100000,           // Normalized rank
        ];
        
        features.push(feature);
        labels.push(records[i + 1].rank);    // Next year's rank
        metadata.push({ collegeCode, branch, category });
      }
    }
  }
  
  console.log(`  Created ${features.length} training samples`);
  return { features, labels, metadata };
}

// Simple SVM implementation using gradient descent
class SimpleSVM {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number = 0.001;
  private lambda: number = 0.01;
  private epochs: number = 1000;
  
  train(features: number[][], labels: number[]): void {
    console.log('\nTraining SVM model...');
    
    const numFeatures = features[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;
    
    // Normalize labels to [-1, 1] range for SVM
    const maxLabel = Math.max(...labels);
    const minLabel = Math.min(...labels);
    const normalizedLabels = labels.map(l => 
      2 * (l - minLabel) / (maxLabel - minLabel) - 1
    );
    
    // Training loop
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      let totalLoss = 0;
      
      for (let i = 0; i < features.length; i++) {
        const x = features[i];
        const y = normalizedLabels[i];
        
        // Calculate prediction
        const prediction = this.predict(x);
        
        // Calculate hinge loss
        const margin = y * prediction;
        
        if (margin < 1) {
          // Update weights
          for (let j = 0; j < this.weights.length; j++) {
            this.weights[j] -= this.learningRate * (
              this.lambda * this.weights[j] - y * x[j]
            );
          }
          this.bias -= this.learningRate * (-y);
          totalLoss += 1 - margin;
        } else {
          // Regularization only
          for (let j = 0; j < this.weights.length; j++) {
            this.weights[j] -= this.learningRate * this.lambda * this.weights[j];
          }
        }
      }
      
      if (epoch % 100 === 0) {
        console.log(`  Epoch ${epoch}: Loss = ${(totalLoss / features.length).toFixed(4)}`);
      }
    }
    
    console.log('  Training complete!');
  }
  
  predict(features: number[]): number {
    let sum = this.bias;
    for (let i = 0; i < features.length; i++) {
      sum += this.weights[i] * features[i];
    }
    return sum;
  }
  
  predictRank(features: number[], minLabel: number, maxLabel: number): number {
    const normalized = this.predict(features);
    // Denormalize from [-1, 1] back to original range
    const rank = ((normalized + 1) / 2) * (maxLabel - minLabel) + minLabel;
    return Math.max(1, Math.round(rank));
  }
  
  getModel(): { weights: number[]; bias: number } {
    return {
      weights: [...this.weights],
      bias: this.bias
    };
  }
}

// Main execution
async function main() {
  console.log('=== SVM-Based Cutoff Prediction Model Training ===\n');
  
  const csvFiles = [
    { path: 'csvfiles/cutoff2022.csv', year: 2022 },
    { path: 'csvfiles/cutoff2023.csv', year: 2023 },
    { path: 'csvfiles/cuttoff2024.csv', year: 2024 },
    { path: 'csvfiles/cutoff2025.csv', year: 2025 }
  ];
  
  // Parse all CSV files
  let allRecords: CutoffRecord[] = [];
  for (const file of csvFiles) {
    if (fs.existsSync(file.path)) {
      const records = parseCSVFile(file.path, file.year);
      allRecords = allRecords.concat(records);
    } else {
      console.log(`Warning: ${file.path} not found`);
    }
  }
  
  console.log(`\nTotal records collected: ${allRecords.length}`);
  
  // Prepare training data
  const trainingData = prepareTrainingData(allRecords);
  
  if (trainingData.features.length === 0) {
    console.error('No training data available!');
    return;
  }
  
  // Train SVM model
  const svm = new SimpleSVM();
  svm.train(trainingData.features, trainingData.labels);
  
  // Save model
  const model = svm.getModel();
  const modelData = {
    model,
    stats: {
      trainingRecords: allRecords.length,
      trainingSamples: trainingData.features.length,
      minRank: Math.min(...trainingData.labels),
      maxRank: Math.max(...trainingData.labels),
      years: [2022, 2023, 2024, 2025]
    },
    categoryMap,
    timestamp: new Date().toISOString()
  };
  
  const modelPath = 'data/svm-model.json';
  fs.mkdirSync(path.dirname(modelPath), { recursive: true });
  fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2));
  
  console.log(`\n✓ Model saved to ${modelPath}`);
  console.log(`\nModel Statistics:`);
  console.log(`  Training Records: ${modelData.stats.trainingRecords}`);
  console.log(`  Training Samples: ${modelData.stats.trainingSamples}`);
  console.log(`  Rank Range: ${modelData.stats.minRank} - ${modelData.stats.maxRank}`);
  console.log(`  Years: ${modelData.stats.years.join(', ')}`);
  
  // Test prediction
  console.log('\n=== Sample Predictions ===');
  const testFeature = [2025, 15, 5000, 100, 0.05]; // Year, Category, Rank, Change, Normalized
  const prediction = svm.predictRank(testFeature, modelData.stats.minRank, modelData.stats.maxRank);
  console.log(`Test input: Year=2025, Category=GM, Rank=5000`);
  console.log(`Predicted 2026 rank: ${prediction}`);
}

main().catch(console.error);
