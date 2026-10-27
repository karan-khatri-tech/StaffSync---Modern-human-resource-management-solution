import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeDocument extends Document {
  id: string;
  userId?: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  joinDate: string;
  phone: string;
  address: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  createdAt: string;
}

const EmployeeSchema = new Schema<IEmployeeDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 },
    joinDate: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const EmployeeModel = mongoose.models.Employee || mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);
