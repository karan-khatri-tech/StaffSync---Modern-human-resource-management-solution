import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveDocument extends Document {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  decisionNote?: string;
}

const LeaveSchema = new Schema<ILeaveDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String, required: true, lowercase: true, index: true },
    department: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    appliedAt: { type: String, default: () => new Date().toISOString() },
    reviewedBy: { type: String },
    reviewedByName: { type: String },
    reviewedAt: { type: String },
    decisionNote: { type: String },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const LeaveModel = mongoose.models.Leave || mongoose.model<ILeaveDocument>('Leave', LeaveSchema);
