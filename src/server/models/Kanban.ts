import mongoose, { Schema, Document } from 'mongoose';

export interface IKanbanDocument extends Document {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedName?: string;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
}

const KanbanSchema = new Schema<IKanbanDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['backlog', 'in_progress', 'review', 'completed'],
      default: 'backlog',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedTo: { type: String },
    assignedName: { type: String },
    dueDate: { type: String },
    tags: [{ type: String }],
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const KanbanModel =
  mongoose.models.Kanban || mongoose.model<IKanbanDocument>('Kanban', KanbanSchema);
