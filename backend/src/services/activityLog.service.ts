import { ActivityLog } from '../models/ActivityLog';

interface LogActivityInput {
  userId?: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity({ userId, action, metadata }: LogActivityInput): Promise<void> {
  try {
    await ActivityLog.create({ userId, action, metadata });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}
