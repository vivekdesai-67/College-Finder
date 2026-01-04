# Design Document: Tech Boom Prediction Feature

## Overview

The Tech Boom Prediction feature provides AI-powered forecasting of engineering branch competitiveness for the upcoming academic year. The system analyzes current branch performance metrics (placement rates, salaries, industry growth, admission trends) to predict which branches will become more competitive (booming) or less competitive (declining) in the next year. Students can view current year cutoffs alongside predicted cutoffs in a dedicated interface with visual analytics.

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Student   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│  Predictions Page Component     │
│  - Current Year Display          │
│  - Predicted Year Display        │
│  - Filters & Search              │
│  - Charts & Visualizations       │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Predictions API Endpoint        │
│  /api/predictions                │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Prediction Engine (lib)         │
│  - calculateBoomScore()          │
│  - predictCutoffs()              │
│  - generateRecommendations()     │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  MongoDB Database                │
│  - Colleges Collection           │
│  - Branches Data                 │
└──────────────────────────────────┘
```

### Component Breakdown

1. **Frontend Layer**
   - `app/predictions/page.tsx` - Main predictions page
   - `components/PredictionCard.tsx` - Individual college prediction display
   - `components/TrendChart.tsx` - Chart visualization component
   - `components/BoomIndicator.tsx` - Visual boom status indicator

2. **API Layer**
   - `app/api/predictions/route.ts` - Predictions endpoint

3. **Business Logic Layer**
   - `lib/prediction.ts` - Core prediction algorithms
   - `lib/recommendation.ts` - Existing recommendation logic (reuse)

4. **Data Layer**
   - MongoDB Collections: `colleges`, `students`
   - No new collections needed (use existing data)

## Components and Interfaces

### 1. Prediction Engine (`lib/prediction.ts`)

```typescript
// Interfaces
export interface BranchPrediction {
  branchName: string;
  currentYear: number;
  predictedYear: number;
  currentCutoff: { [category: string]: number };
  predictedCutoff: { [category: string]: number };
  boomScore: number;  // 0-1
  boomStatus: 'booming' | 'stable' | 'declining';
  adjustmentFactor: number;  // e.g., 0.8 = 20% decrease (more competitive)
  metrics: {
    placementRate: number;
    avgSalary: number;
    salaryGrowth: number;  // calculated
    industryGrowth: number;
    admissionTrend: number;
  };
  reasoning: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface CollegePrediction {
  college: {
    _id: string;
    name: string;
    location: string;
    type: string;
    fees: number;
    infraRating: number;
  };
  branches: BranchPrediction[];
  overallBoomScore: number;
}

// Core Functions
export function calculateBoomScore(branch: Branch): number;
export function predictCutoffAdjustment(boomScore: number): number;
export function generateBranchPrediction(branch: Branch, currentYear: number): BranchPrediction;
export function generateCollegePredictions(colleges: College[]): CollegePrediction[];
export function filterByStudentProfile(predictions: CollegePrediction[], student: Student): CollegePrediction[];
```

### 2. Predictions API (`app/api/predictions/route.ts`)

```typescript
// GET /api/predictions
// Query params: ?category=3BG&rank=10000&branches=CS,AI
// Response:
{
  currentYear: 2025,
  predictedYear: 2026,
  studentProfile: {
    rank: 10000,
    category: "3BG",
    preferredBranches: ["Computer Science", "AI & ML"]
  },
  predictions: CollegePrediction[],
  trendingSummary: {
    topBoomingBranches: string[],
    topDecliningBranches: string[],
    averageCutoffChange: number
  }
}
```

### 3. Predictions Page Component (`app/predictions/page.tsx`)

```typescript
// Main page structure
- Header with title and description
- Student profile summary (rank, category, preferred branches)
- Filter controls (branch selector, college type filter)
- Tabs or sections:
  - "Current Year (2025)" section
  - "Predicted Year (2026)" section
  - Side-by-side comparison view
- Chart section showing trends
- College prediction cards grid
- Legend explaining boom indicators
```

### 4. Prediction Card Component (`components/PredictionCard.tsx`)

```typescript
interface PredictionCardProps {
  collegePrediction: CollegePrediction;
  studentCategory: string;
  studentRank: number;
  viewMode: 'side-by-side' | 'current' | 'predicted';
}

// Displays:
- College name, location, type
- Current vs Predicted cutoffs (side-by-side)
- Boom status indicator (🔥/🟢/🔵)
- Eligibility status for student
- Metrics comparison (placement, salary)
- Reasoning for prediction
```

## Data Models

### Existing Models (No Changes Needed)

**College Model** (already exists):
```typescript
{
  name: string;
  location: string;
  fees: number;
  infraRating: number;
  branchesOffered: [
    {
      name: string;
      cutoff: { [category: string]: number };
      placementRate: number;
      avgSalary: number;
      maxSalary: number;
      admissionTrend: number;
      industryGrowth: number;
      isBooming: boolean;
    }
  ];
  type: "Government" | "Private" | "Autonomous";
  accreditation: string;
  image: string;
}
```

**Student Model** (already exists):
```typescript
{
  username: string;
  rank: number;
  category: string;
  preferredBranch: string[];
  wishlist: ObjectId[];
}
```

### No New Database Collections Required

The prediction system will work entirely with existing data, calculating predictions on-the-fly based on current branch metrics.

