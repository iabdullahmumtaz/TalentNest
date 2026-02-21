import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'applicant' | 'employer';

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  company?: string;
  title?: string;
  skills: string[];
  resume?: string;
}

export interface IUserMethods {
  comparePassword(pw: string): Promise<boolean>;
}

export type IUserDocument = HydratedDocument<IUser, IUserMethods>;
export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['applicant', 'employer'], required: true },
    company: String,
    title: String,
    skills: [String],
    resume: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (pw: string) {
  return bcrypt.compare(pw, this.password);
};

export default mongoose.model<IUser, UserModel>('User', userSchema);
