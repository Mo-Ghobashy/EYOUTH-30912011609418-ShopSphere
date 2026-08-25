import { prisma } from '../config/prisma';

interface LogActivityInput {
  userId?: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity({ userId, action, metadata }: LogActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}
