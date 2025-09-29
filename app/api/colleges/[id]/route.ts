// import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import College from "@/lib/models/College";
// import mongoose from "mongoose";

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   await connectDB();
//   const { id } = params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
//   }

//   const college = await College.findById(id);
//   if (!college) {
//     return NextResponse.json({ error: "College not found" }, { status: 404 });
//   }

//   return NextResponse.json({ college });
// }
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import College from "@/lib/models/College";
import mongoose from "mongoose";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const college = await College.findById(id);
  if (!college) {
    return NextResponse.json({ error: "College not found" }, { status: 404 });
  }

  return NextResponse.json({ college });
}
