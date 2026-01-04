# Quick Start: SVM Prediction Model

## ✅ What's Been Done

1. **Trained SVM Model** on 2022-2024 cutoff data
   - 16,648 records processed
   - 5,937 training samples created
   - Model accuracy: R² = 0.63 (63% variance explained)

2. **Created Prediction API** at `/api/predict-svm`
   - Single predictions
   - Batch predictions
   - Branch-specific predictions
   - Model information endpoint

3. **Model Files Created**:
   - `data/svm-prediction-model.json` - Trained model
   - `lib/svm-prediction.ts` - Prediction library
   - `app/api/predict-svm/route.ts` - API endpoint
   - `scripts/train-svm-prediction.py` - Training script

## 🚀 Usage

### Test the API

```bash
# Get model info
curl http://localhost:3000/api/predict-svm

# Make a prediction
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

### Use in Your Code

```typescript
import { predictRank } from '@/lib/svm-prediction';

// Predict next year's rank
const predicted = predictRank(2024, 'GM', 5000, 4800);
console.log(`Predicted 2025 rank: ${predicted}`);
```

### Retrain Model

When you have new data:

```bash
# Add new CSV to csvfiles/ directory
# Then run:
python3 scripts/train-svm-prediction.py
```

## 📊 Model Performance

- **MAE (Mean Absolute Error)**: ~20,108 ranks
- **RMSE**: ~31,771 ranks
- **R² Score**: 0.63
- **Training Data**: 2022-2024 (3 years)
- **Categories**: 24 (1G, 2AG, GM, SCG, etc.)

## 📁 Files Location

```
csvfiles/
  ├── cutoff2022.csv
  ├── cutoff2023.csv
  ├── cuttoff2024.csv
  └── cutoff2025.csv

data/
  └── svm-prediction-model.json

lib/
  └── svm-prediction.ts

app/api/predict-svm/
  └── route.ts

scripts/
  └── train-svm-prediction.py

docs/
  └── SVM_PREDICTION_MODEL.md
```

## 🎯 Next Steps

1. **Integrate with UI**: Add prediction feature to college pages
2. **Add Visualizations**: Show prediction trends
3. **Improve Accuracy**: Add more features (placement data, rankings)
4. **Real-time Updates**: Retrain model as new data arrives

## 📖 Full Documentation

See `docs/SVM_PREDICTION_MODEL.md` for complete API documentation and usage examples.
