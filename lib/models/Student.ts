// // import mongoose from 'mongoose';
// // import bcrypt from 'bcryptjs';

// // const studentSchema = new mongoose.Schema({
// //   username: { type: String, required: true, unique: true },
// //   email: { type: String, required: true, unique: true },
// //   password: { type: String, required: true },
// //   address: { type: String, required: true },
// //   rank: { type: Number },
// //   category: { type: String, enum: ['general', 'obc', 'sc', 'st'], default: 'general' },
// //   preferredBranch: { type: String },
// //   wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
// //   profileComplete: { type: Boolean, default: false }
// // }, {
// //   timestamps: true
// // });

// // studentSchema.pre('save', async function(next) {
// //   if (!this.isModified('password')) return next();
// //   this.password = await bcrypt.hash(this.password, 12);
// //   next();
// // });

// // studentSchema.methods.comparePassword = async function(password: string) {
// //   return bcrypt.compare(password, this.password);
// // };

// // export default mongoose.models.Student || mongoose.model('Student', studentSchema);
// import mongoose, { Model, Document } from 'mongoose';
// import bcrypt from 'bcryptjs';
// import College from './College'; // Ensure College is imported for wishlist references

// export interface IStudent extends Document {
//   username: string;
//   email: string;
//   password: string;
//   address: string;
//   // rank?: number;
//   // rank: { type: Number, default: null },
//   rank: number | null;
//   category: 
//     | '1G' | '1K' | '1R' | '2AG' | '2AK' | '2AR' | '2BG' | '2BK' | '2BR'
//     | '3AG' | '3AK' | '3AR' | '3BG' | '3BK' | '3BR' | 'GM' | 'GMK' | 'GMP' | 'GMR'
//     | 'NRI' | 'OPN' | 'OTH' | 'SCG' | 'SCK' | 'SCR' | 'STG' | 'STK' | 'STR';
//   preferredBranch?: string;
//   wishlist: mongoose.Types.ObjectId[];
//   profileComplete: boolean;
//   comparePassword(password: string): Promise<boolean>;
// }

// const studentSchema = new mongoose.Schema<IStudent>({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   address: { type: String, required: true },
//   rank: { type: Number },
//   category: { 
//     type: String, 
//     enum: [
//       '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR',
//       '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMP', 'GMR',
//       'NRI', 'OPN', 'OTH', 'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR'
//     ], 
//     default: 'GM' 
//   },
//   preferredBranch: { type: String },
//   wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: College.modelName }],
//   profileComplete: { type: Boolean, default: false }
// }, {
//   timestamps: true
// });

// studentSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// studentSchema.methods.comparePassword = async function(password: string) {
//   return bcrypt.compare(password, this.password);
// };

// // ✅ Type assertion to prevent TS2590 error
// const Student: Model<IStudent> = mongoose.models.Student as Model<IStudent> || mongoose.model<IStudent>('Student', studentSchema);

// export default Student;
import mongoose, { Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import College from './College';

export interface IStudent extends Document {
  clerkId?: string; // Clerk user ID for syncing
  username: string;
  email: string;
  password?: string; // Optional for Clerk users
  firstName?: string;
  lastName?: string;
  address?: string; // Optional for Clerk users
  phone?: string;
  rank: number | null;
  category:
    | '1G' | '1K' | '1R' | '2AG' | '2AK' | '2AR' | '2BG' | '2BK' | '2BR'
    | '3AG' | '3AK' | '3AR' | '3BG' | '3BK' | '3BR' | 'GM' | 'GMK' | 'GMP' | 'GMR'
    | 'NRI' | 'OPN' | 'OTH' | 'SCG' | 'SCK' | 'SCR' | 'STG' | 'STK' | 'STR';
  preferredBranch: string[]; // ✅ now array instead of single string
  wishlist: mongoose.Types.ObjectId[];
  profileComplete: boolean;
  comparePassword?(password: string): Promise<boolean>;
}

const studentSchema = new mongoose.Schema<IStudent>(
  {
    clerkId: { type: String, unique: true, sparse: true, required: true }, // Required for Clerk users
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Not needed for Clerk users
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String }, // Not needed for Clerk users
    phone: { type: String },
    rank: { type: Number, default: null },
    category: {
      type: String,
      enum: [
        '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR',
        '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMP', 'GMR',
        'NRI', 'OPN', 'OTH', 'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR'
      ],
      default: 'GM',
    },
    preferredBranch: [{ type: String }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: College.modelName }],
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔒 Hash password before saving (only if password exists)
studentSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔑 Password comparison method (only for JWT users)
studentSchema.methods.comparePassword = async function (password: string) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// ✅ Safe model export (avoids recompilation errors)
const Student: Model<IStudent> =
  (mongoose.models.Student as Model<IStudent>) ||
  mongoose.model<IStudent>('Student', studentSchema);

export default Student;
