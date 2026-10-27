import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingDocument extends Document {
  id: string;
  title: string;
  description: string;
  trainerName: string;
  scheduledDate: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
}

const TrainingSchema = new Schema<ITrainingDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    trainerName: { type: String, required: true, trim: true },
    scheduledDate: { type: String, required: true },
    assignedTo: { type: String, required: true, default: 'All Employees' },
    createdBy: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const TrainingModel =
  mongoose.models.Training || mongoose.model<ITrainingDocument>('Training', TrainingSchema);
