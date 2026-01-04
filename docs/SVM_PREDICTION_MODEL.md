# SVM-Based Cutoff Rank Prediction Model

## Overview

This system uses Support Vector Machine (SVM) regression with RBF kernel to predict KCET cutoff ranks based on historical data from 2022-2025.

## Model Training

### Data Sources
- `csvfiles/cutoff2022.csv` - 2022 cutoff data
- `csvfiles/cutoff2023.csv` - 2023 cutoff data
- `csvfiles/cuttoff2024.csv` - 2024 cutoff data
- `csvfiles/cutoff2025.csv` - 2025 cutoff data

### Training Script
```bash
python3 scripts/train-svm-prediction.py
```

### Model Performance
- **Training MAE**: ~21,259 ranks
- **Test MAE**: ~20,108 ranks
- **Training R²**: 0.5997
- **Test R²**: 0.6301

### Model Statistics
- **Total Records**: 16,648 (after cleaning)
- **Training Samples**: 5,937
- **Rank Range**: 242 - 269,852
- **Years**: 2022, 2023, 2024
- **Colleges**: 253
- **Branches**: 394
- **Categories**: 24

## Features Used

The model uses 6 features for prediction:

1. **Year**: The current year
2. **Category Encoded**: Numerical encoding of category (1G, 2AG, GM, etc.)
3. **Current Rank**: The cutoff rank for current year
4. **Rank Change**: Difference from previous year
5. **Rank Trend**: Percentage change in rank
6. **Log Rank**: Log-transformed rank for better scaling

## API Usage

### Endpoint: `/api/predict-svm`

#### 1. Single Prediction

**Request:**
```bash
curl -X POST http://localhost:3000/api/predict-svm \
  -H "Content-Type: application/json" \
  -d '{
    "action": "predict",
    "year": 2024,
    "category": "GM",
    "currentRank": 5000,
    "previousRank": 4800
  }'
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "year": 2025,
    "predictedRank": 5150,
    "input": {
      "year": 2024,
      "category": "GM",
      "currentRank": 5000,
      "previousRank": 4800
    }
  }
}
```

#### 2. Branch Prediction

**Request:**
```bash
curl -X POST http://localhost:3000/api/predict-svm \
  -H "Content-Type: application/json" \
  -d '{
    "action": "predictBranch",
    "collegeCode": "E001",
    "branch": "Computer Science and Engineering",
    "category": "GM",
    "historicalRanks": [
      { "year": 2022, "rank": 4500 },
      { "year": 2023, "rank": 4700 },
      { "year": 2024, "rank": 5000 }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "year": 2025,
      "predictedRank": 5200,
      "confidence": "high"
    },
    {
      "year": 2026,
      "predictedRank": 5400,
      "confidence": "high"
    }
  ]
}
```

#### 3. Batch Prediction

**Request:**
```bash
curl -X POST http://localhost:3000/api/predict-svm \
  -H "Content-Type: application/json" \
  -d '{
    "action": "batchPredict",
    "requests": [
      {
        "year": 2024,
        "category": "GM",
        "currentRank": 5000
      },
      {
        "year": 2024,
        "category": "1G",
        "currentRank": 3000
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "predictedRank": 5150,
      "input": { "year": 2024, "category": "GM", "currentRank": 5000 }
    },
    {
      "predictedRank": 3100,
      "input": { "year": 2024, "category": "1G", "currentRank": 3000 }
    }
  ]
}
```

#### 4. Model Information

**Request:**
```bash
curl http://localhost:3000/api/predict-svm
```

**Response:**
```json
{
  "success": true,
  "message": "SVM Prediction Model API",
  "modelInfo": {
    "modelType": "SVM_RBF",
    "trainingYears": [2022, 2023, 2024],
    "totalRecords": 16648,
    "trainingSamples": 5937,
    "rankRange": {
      "min": 242,
      "max": 269852
    },
    "categories": ["1G", "1K", "1R", "2AG", "2AK", ...]
  }
}
```

## Categories Supported

- **1G, 1K, 1R**: Category 1 (General, Kannada, Rural)
- **2AG, 2AK, 2AR**: Category 2A (General, Kannada, Rural)
- **2BG, 2BK, 2BR**: Category 2B (General, Kannada, Rural)
- **3AG, 3AK, 3AR**: Category 3A (General, Kannada, Rural)
- **3BG, 3BK, 3BR**: Category 3B (General, Kannada, Rural)
- **GM, GMK, GMR**: General Merit (General, Kannada, Rural)
- **SCG, SCK, SCR**: Scheduled Caste (General, Kannada, Rural)
- **STG, STK, STR**: Scheduled Tribe (General, Kannada, Rural)

## Integration with Existing System

### TypeScript/JavaScript Usage

```typescript
import { predictRank, predictRankForBranch, getModelInfo } from '@/lib/svm-prediction';

// Single prediction
const predicted = predictRank(2024, 'GM', 5000, 4800);
console.log(`Predicted rank: ${predicted}`);

// Branch prediction
const predictions = predictRankForBranch(
  'E001',
  'Computer Science and Engineering',
  'GM',
  [
    { year: 2022, rank: 4500 },
    { year: 2023, rank: 4700 },
    { year: 2024, rank: 5000 }
  ]
);

// Get model info
const info = getModelInfo();
console.log(info);
```

## Model Files

- **Training Script**: `scripts/train-svm-prediction.py`
- **Model File**: `data/svm-prediction-model.json`
- **Prediction Library**: `lib/svm-prediction.ts`
- **API Endpoint**: `app/api/predict-svm/route.ts`

## Retraining the Model

To retrain with new data:

1. Add new CSV files to `csvfiles/` directory
2. Update the file list in `scripts/train-svm-prediction.py`
3. Run: `python3 scripts/train-svm-prediction.py`
4. The model will be saved to `data/svm-prediction-model.json`
5. Restart your Next.js server to load the new model

## Limitations

- Predictions are based on historical trends
- Accuracy decreases for predictions further into the future
- Requires at least 2 years of historical data for best results
- Model assumes similar admission patterns continue

## Future Improvements

- Add more features (college ranking, placement data, etc.)
- Implement ensemble methods (combine multiple models)
- Add confidence intervals for predictions
- Include external factors (industry trends, job market)
- Real-time model updates as new data becomes available
