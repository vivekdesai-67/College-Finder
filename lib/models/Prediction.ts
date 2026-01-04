import mongoose from 'mongoose';

const HistoricalCutoffSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  rank: { type: Number, required: true },
  round: { type: String, default: 'FIRST' }
}, { _id: false });

const PredictionSchema = new mongoose.Schema<any>({
  // College Information
  college: { type: String, required: true, index: true },
  collegeCode: { type: String, required: true, index: true },
  
  // Branch Information
  branch: { type: String, required: true, index: true },
  
  // Category
  category: { type: String, required: true, index: true },
  
  // Predictions
  predictedCutoff2025: { type: Number, required: true },
  predictedCutoff2026: { type: Number, required: true },
  
  // Metadata
  confidence: { type: Number, required: true },
  trend: { type: String, enum: ['increasing', 'decreasing', 'stable'], required: true },
  changePercentage: { type: Number, required: true },
  
  // Historical Data
  historicalData: [HistoricalCutoffSchema],
  
  // Timestamps
  generatedAt: { type: Date, default: Date.now },
  
}, {
  timestamps: true,
  collection: 'predictions'
});

// Compound indexes for efficient querying
PredictionSchema.index({ category: 1, branch: 1 });
PredictionSchema.index({ category: 1, predictedCutoff2026: 1 });
PredictionSchema.index({ college: 1, category: 1 });

const Prediction = (mongoose.models.Prediction as any) || mongoose.model<any>('Prediction', PredictionSchema);

export default Prediction;
