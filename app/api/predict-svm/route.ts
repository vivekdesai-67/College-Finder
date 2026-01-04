import { NextRequest, NextResponse } from 'next/server';
import { predictRank, predictRankForBranch, getModelInfo, batchPredict } from '@/lib/svm-prediction';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'predict': {
        const { year, category, currentRank, previousRank } = params;
        
        if (!year || !category || !currentRank) {
          return NextResponse.json(
            { error: 'Missing required parameters: year, category, currentRank' },
            { status: 400 }
          );
        }

        const predictedRank = predictRank(year, category, currentRank, previousRank);
        
        return NextResponse.json({
          success: true,
          prediction: {
            year: year + 1,
            predictedRank,
            input: { year, category, currentRank, previousRank }
          }
        });
      }

      case 'predictBranch': {
        const { collegeCode, branch, category, historicalRanks } = params;
        
        if (!collegeCode || !branch || !category || !historicalRanks) {
          return NextResponse.json(
            { error: 'Missing required parameters: collegeCode, branch, category, historicalRanks' },
            { status: 400 }
          );
        }

        const predictions = predictRankForBranch(collegeCode, branch, category, historicalRanks);
        
        return NextResponse.json({
          success: true,
          predictions,
          input: { collegeCode, branch, category }
        });
      }

      case 'batchPredict': {
        const { requests } = params;
        
        if (!requests || !Array.isArray(requests)) {
          return NextResponse.json(
            { error: 'Missing or invalid requests array' },
            { status: 400 }
          );
        }

        const predictions = batchPredict(requests);
        
        return NextResponse.json({
          success: true,
          predictions
        });
      }

      case 'modelInfo': {
        const info = getModelInfo();
        
        return NextResponse.json({
          success: true,
          modelInfo: info
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: predict, predictBranch, batchPredict, or modelInfo' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('SVM Prediction error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const info = getModelInfo();
    
    return NextResponse.json({
      success: true,
      message: 'SVM Prediction Model API',
      modelInfo: info,
      endpoints: {
        POST: {
          predict: {
            description: 'Predict next year rank for a single entry',
            parameters: {
              action: 'predict',
              year: 'number',
              category: 'string (e.g., GM, 1G, 2AG)',
              currentRank: 'number',
              previousRank: 'number (optional)'
            }
          },
          predictBranch: {
            description: 'Predict ranks for a specific college branch',
            parameters: {
              action: 'predictBranch',
              collegeCode: 'string',
              branch: 'string',
              category: 'string',
              historicalRanks: 'array of {year, rank}'
            }
          },
          batchPredict: {
            description: 'Predict multiple ranks at once',
            parameters: {
              action: 'batchPredict',
              requests: 'array of prediction requests'
            }
          },
          modelInfo: {
            description: 'Get model information',
            parameters: {
              action: 'modelInfo'
            }
          }
        }
      }
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
