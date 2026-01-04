#!/usr/bin/env python3
"""
SVM-based Cutoff Rank Prediction Model
Trains on 2022-2025 cutoff data to predict future ranks
"""

import pandas as pd
import numpy as np
import json
import os
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

def parse_csv_file(filepath, year):
    """Parse KCET cutoff CSV file"""
    print(f"\nParsing {os.path.basename(filepath)} for year {year}...")
    
    try:
        # Read the file
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        records = []
        current_college = ''
        current_code = ''
        categories = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            parts = [p.strip() for p in line.split(',')]
            
            # Detect college info
            if len(parts) > 2 and parts[1].startswith('E'):
                current_code = parts[1]
                current_college = parts[2] if len(parts) > 2 else ''
                continue
            
            # Detect category headers
            if '1G' in line and 'GM' in line:
                categories = [p for p in parts if p and p in [
                    '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR',
                    '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMR',
                    'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR'
                ]]
                continue
            
            # Parse branch data
            if current_college and categories and len(parts) > 3:
                branch = ' '.join(parts[:2]).strip()
                if not branch or len(branch) < 3:
                    continue
                
                # Parse ranks
                for j, cat in enumerate(categories):
                    if j + 2 < len(parts):
                        rank_str = parts[j + 2].replace('--', '').replace(' ', '')
                        if rank_str and rank_str.isdigit():
                            rank = int(rank_str)
                            if rank > 0:
                                records.append({
                                    'year': year,
                                    'college_code': current_code,
                                    'college': current_college,
                                    'branch': branch,
                                    'category': cat,
                                    'rank': rank
                                })
        
        print(f"  Extracted {len(records)} records")
        return pd.DataFrame(records)
    
    except Exception as e:
        print(f"  Error parsing file: {e}")
        return pd.DataFrame()

def prepare_training_data(df):
    """Prepare features and labels for training"""
    print("\nPreparing training data...")
    
    # Create category encoding
    category_map = {cat: i for i, cat in enumerate(df['category'].unique())}
    df['category_encoded'] = df['category'].map(category_map)
    
    # Group by college, branch, category
    grouped = df.groupby(['college_code', 'branch', 'category'])
    
    features = []
    labels = []
    metadata = []
    
    for name, group in grouped:
        group = group.sort_values('year')
        
        # Need at least 2 years for training
        if len(group) >= 2:
            for i in range(len(group) - 1):
                current = group.iloc[i]
                next_year = group.iloc[i + 1]
                
                # Calculate features
                rank_change = current['rank'] - group.iloc[i-1]['rank'] if i > 0 else 0
                rank_trend = rank_change / current['rank'] if current['rank'] > 0 else 0
                
                feature = [
                    float(current['year']),
                    float(current['category_encoded']),
                    float(current['rank']),
                    float(rank_change),
                    float(rank_trend),
                    float(np.log1p(float(current['rank']))),  # Log-transformed rank
                ]
                
                features.append(feature)
                labels.append(next_year['rank'])
                metadata.append({
                    'college_code': name[0],
                    'branch': name[1],
                    'category': name[2]
                })
    
    print(f"  Created {len(features)} training samples")
    return np.array(features), np.array(labels), metadata, category_map

def train_svm_model(X, y):
    """Train SVM regression model"""
    print("\nTraining SVM model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train SVM with RBF kernel
    print("  Training with RBF kernel...")
    svm = SVR(kernel='rbf', C=100, gamma='scale', epsilon=0.1)
    svm.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_pred = svm.predict(X_train_scaled)
    test_pred = svm.predict(X_test_scaled)
    
    print(f"\n  Training Metrics:")
    print(f"    MAE: {mean_absolute_error(y_train, train_pred):.2f}")
    print(f"    RMSE: {np.sqrt(mean_squared_error(y_train, train_pred)):.2f}")
    print(f"    R²: {r2_score(y_train, train_pred):.4f}")
    
    print(f"\n  Test Metrics:")
    print(f"    MAE: {mean_absolute_error(y_test, test_pred):.2f}")
    print(f"    RMSE: {np.sqrt(mean_squared_error(y_test, test_pred)):.2f}")
    print(f"    R²: {r2_score(y_test, test_pred):.4f}")
    
    return svm, scaler

def save_model(svm, scaler, category_map, stats):
    """Save model to JSON format"""
    print("\nSaving model...")
    
    model_data = {
        'model_type': 'SVM_RBF',
        'scaler': {
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist()
        },
        'svm': {
            'support_vectors': svm.support_vectors_.tolist(),
            'dual_coef': svm.dual_coef_.tolist(),
            'intercept': svm.intercept_.tolist(),
            'gamma': float(svm._gamma),
            'kernel': 'rbf'
        },
        'category_map': category_map,
        'stats': stats,
        'timestamp': pd.Timestamp.now().isoformat()
    }
    
    os.makedirs('data', exist_ok=True)
    with open('data/svm-prediction-model.json', 'w') as f:
        json.dump(model_data, f, indent=2)
    
    print("  ✓ Model saved to data/svm-prediction-model.json")

def main():
    print("=" * 60)
    print("SVM-Based Cutoff Rank Prediction Model Training")
    print("=" * 60)
    
    # Load all CSV files
    csv_files = [
        ('csvfiles/cutoff2022.csv', 2022),
        ('csvfiles/cutoff2023.csv', 2023),
        ('csvfiles/cuttoff2024.csv', 2024),
        ('csvfiles/cutoff2025.csv', 2025)
    ]
    
    all_data = []
    for filepath, year in csv_files:
        if os.path.exists(filepath):
            df = parse_csv_file(filepath, year)
            if not df.empty:
                all_data.append(df)
        else:
            print(f"Warning: {filepath} not found")
    
    if not all_data:
        print("Error: No data loaded!")
        return
    
    # Combine all data
    df = pd.concat(all_data, ignore_index=True)
    
    # Clean data - remove invalid ranks
    print(f"\nTotal records before cleaning: {len(df)}")
    df = df[df['rank'] > 0]
    df = df[df['rank'] < 300000]  # Remove unrealistic ranks
    print(f"Total records after cleaning: {len(df)}")
    
    print(f"Years: {sorted(df['year'].unique())}")
    print(f"Colleges: {df['college_code'].nunique()}")
    print(f"Branches: {df['branch'].nunique()}")
    print(f"Categories: {df['category'].nunique()}")
    
    # Prepare training data
    X, y, metadata, category_map = prepare_training_data(df)
    
    if len(X) == 0:
        print("Error: No training samples created!")
        return
    
    # Train model
    svm, scaler = train_svm_model(X, y)
    
    # Save model
    stats = {
        'total_records': len(df),
        'training_samples': len(X),
        'min_rank': int(y.min()),
        'max_rank': int(y.max()),
        'mean_rank': float(y.mean()),
        'years': sorted(df['year'].unique().tolist()),
        'num_colleges': int(df['college_code'].nunique()),
        'num_branches': int(df['branch'].nunique()),
        'num_categories': int(df['category'].nunique())
    }
    
    save_model(svm, scaler, category_map, stats)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    print(f"\nModel Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")

if __name__ == '__main__':
    main()
