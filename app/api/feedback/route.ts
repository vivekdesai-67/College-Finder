import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import connectDB from "@/lib/mongodb";
import Feedback from "@/lib/models/Feedback";
import Student from "@/lib/models/Student";
import { requireAdmin } from '@/lib/roleAuth';

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const clerkUserId = authResult.userId;
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string = clerkUserId;
    let username: string = "Anonymous";
    
    // Get username from Student model
    await connectDB();
    const student = await Student.findOne({ clerkId: clerkUserId });
    if (student) {
      username = student.username;
    }

    const body = await req.json();
    const { rating, category, message } = body;

    // Validate required fields
    if (!rating || !category) {
      return NextResponse.json(
        { error: "Rating and category are required" },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await Feedback.create({
      userId,
      username,
      rating,
      category,
      message: message || "",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET endpoint for admin to view feedback
export async function GET(req: NextRequest) {
  try {
    // Check admin authorization using role-based auth
    const { userId } = await requireAdmin();

    await connectDB();

    const feedbacks = await Feedback.find({})
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ feedbacks });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

