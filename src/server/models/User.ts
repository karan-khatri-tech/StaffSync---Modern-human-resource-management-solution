import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'employee' | 'manager';
  department: string;
  position: string;
  salary?: number;
  joinDate?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  createdAt: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['employee', 'manager'], required: true },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, default: 0 },
    joinDate: { type: String },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
