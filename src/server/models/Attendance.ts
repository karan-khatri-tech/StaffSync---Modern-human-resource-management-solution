import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceDocument extends Document {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  durationMinutes?: number;
  status: 'Present' | 'In Progress' | 'Checked Out' | 'Absent';
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String, required: true, lowercase: true, index: true },
    department: { type: String, required: true },
    date: { type: String, required: true, index: true },
    checkInTime: { type: String, required: true },
    checkOutTime: { type: String },
    durationMinutes: { type: Number },
    status: {
      type: String,
      enum: ['Present', 'In Progress', 'Checked Out', 'Absent'],
      default: 'Present',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index to ensure uniqueness per employee per date
AttendanceSchema.index({ employeeEmail: 1, date: 1 }, { unique: true });

export const AttendanceModel =
  mongoose.models.Attendance || mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);
