import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: String, index: true },
    action: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
