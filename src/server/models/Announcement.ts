import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncementDocument extends Document {
  id: string;
  title: string;
  message: string;
  audience: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  pinned?: boolean;
}

const AnnouncementSchema = new Schema<IAnnouncementDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: { type: String, required: true, default: 'All Employees' },
    createdBy: { type: String, required: true },
    createdByName: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    pinned: { type: Boolean, default: false },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const AnnouncementModel =
  mongoose.models.Announcement || mongoose.model<IAnnouncementDocument>('Announcement', AnnouncementSchema);
