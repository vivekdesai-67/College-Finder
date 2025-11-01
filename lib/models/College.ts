// import mongoose, { Model, Document } from "mongoose";

// interface ICutoff {
//   general: number;
//   obc: number;
//   sc: number;
//   st: number;
// }

// interface IBranch {
//   name: string;
//   cutoff: ICutoff;
//   placementRate?: number;
//   avgSalary?: number;
//   maxSalary?: number;
//   admissionTrend?: number;
//   industryGrowth?: number;
//   isBooming?: boolean;
// }

// export interface ICollege extends Document {
//   name: string;
//   location: string;
//   fees: number;
//   infraRating?: number;
//   branchesOffered: IBranch[];
//   catalogueUrl?: string;
//   description?: string;
//   views?: number;
//   established?: number;
//   type?: "Government" | "Private" | "Autonomous";
//   accreditation?: string;
//   image?: string;
// }

// const cutoffSchema = new mongoose.Schema<ICutoff>({
//   general: { type: Number, required: true },
//   obc: { type: Number, required: true },
//   sc: { type: Number, required: true },
//   st: { type: Number, required: true },
// });

// const branchSchema = new mongoose.Schema<IBranch>({
//   name: { type: String, required: true },
//   cutoff: cutoffSchema,
//   placementRate: { type: Number, default: 0.7 },
//   avgSalary: { type: Number, default: 500000 },
//   maxSalary: { type: Number, default: 2000000 },
//   admissionTrend: { type: Number, default: 0.5 },
//   industryGrowth: { type: Number, default: 0.6 },
//   isBooming: { type: Boolean, default: false },
// });

// const collegeSchema = new mongoose.Schema<ICollege>(
//   {
//     name: { type: String, required: true },
//     location: { type: String, required: true },
//     fees: { type: Number, required: true },
//     infraRating: { type: Number, min: 1, max: 5, default: 3 },
//     branchesOffered: [branchSchema],
//     catalogueUrl: { type: String },
//     description: { type: String },
//     views: { type: Number, default: 0 },
//     established: { type: Number },
//     type: {
//       type: String,
//       enum: ["Government", "Private", "Autonomous"],
//       default: "Private",
//     },
//     accreditation: { type: String, default: "AICTE" },
//     image: {
//       type: String,
//       default:
//         "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg",
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Proper type assertion
// const College: Model<ICollege> =
//   (mongoose.models.College as Model<ICollege>) ||
//   mongoose.model<ICollege>("College", collegeSchema);

// export default College;
import mongoose, { Model, Document } from "mongoose";

interface ICutoff {
  [key: string]: number | null; // e.g. { "GM": 500, "2AG": 1200, ... }
}

interface IBranch {
  name: string;
  cutoff: ICutoff;
  placementRate?: number;
  avgSalary?: number;
  maxSalary?: number;
  admissionTrend?: number;
  industryGrowth?: number;
  isBooming?: boolean;
}

export interface ICollege extends Document {
  name: string;
  location: string;
  fees: number;
  infraRating?: number;
  branchesOffered: IBranch[];
  catalogueUrl?: string;
  description?: string;
  views?: number;
  established?: number;
  type?: "Government" | "Private" | "Autonomous";
  accreditation?: string;
  image?: string;
}

const cutoffSchema = new mongoose.Schema(
  {
    values: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  { _id: false }
);

const branchSchema = new mongoose.Schema<IBranch>({
  name: { type: String, required: true },
  cutoff: {
    type: Map,
    of: Number,
    required: true,
  },
  placementRate: { type: Number, default: 0.7 },
  avgSalary: { type: Number, default: 500000 },
  maxSalary: { type: Number, default: 2000000 },
  admissionTrend: { type: Number, default: 0.5 },
  industryGrowth: { type: Number, default: 0.6 },
  isBooming: { type: Boolean, default: false },
});

const collegeSchema = new mongoose.Schema<ICollege>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    fees: { type: Number, required: true },
    infraRating: { type: Number, min: 1, max: 5, default: 3 },
    branchesOffered: [branchSchema],
    catalogueUrl: { type: String },
    description: { type: String },
    views: { type: Number, default: 0 },
    established: { type: Number },
    type: {
      type: String,
      enum: ["Government", "Private", "Autonomous"],
      default: "Private",
    },
    accreditation: { type: String, default: "AICTE" },
    image: {
      type: String,
      default:
        "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg",
    },
  },
  { timestamps: true }
);

const College: Model<ICollege> =
  (mongoose.models.College as Model<ICollege>) ||
  mongoose.model<ICollege>("College", collegeSchema);

export default College;
