import mongoose, { Model, Document } from "mongoose";

export interface IFeedback extends Document {
  userId: string;
  username: string;
  rating: number;
  category: string;
  message: string;
  createdAt: Date;
}

const feedbackSchema = new mongoose.Schema<IFeedback>({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  category: {
    type: String,
    required: true,
    enum: ["ui", "features", "predictions", "recommendations", "performance", "other"],
  },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Feedback: Model<IFeedback> =
  (mongoose.models.Feedback as Model<IFeedback>) ||
  mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default Feedback;
