// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const adminSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, default: 'admin' }
// }, {
//   timestamps: true
// });

// adminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// adminSchema.methods.comparePassword = async function(password: string) {
//   return bcrypt.compare(password, this.password);
// };

// export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);
import mongoose, { Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IAdmin extends Document {
  username: string;
  password: string;
  role: string;
  comparePassword(password: string): Promise<boolean>;
}

const adminSchema = new mongoose.Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, {
  timestamps: true
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

// ✅ Type assertion to avoid union type too complex
const Admin: Model<IAdmin> = mongoose.models.Admin as Model<IAdmin> || mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;
