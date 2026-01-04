import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Prediction from "@/lib/models/Prediction";

export async function GET() {
  try {
    await connectDB();
    
    const count = await Prediction.countDocuments();
    const sample = await Prediction.findOne({}).lean();
    
    return NextResponse.json({
      success: true,
      totalPredictions: count,
      collectionName: Prediction.collection.name,
      samplePrediction: sample
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
