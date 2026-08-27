import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../middleware/logger';
import { env } from '../config/env';
import { logActivity } from '../services/activityLog.service';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import { sanitizeUser } from '../utils/user';

async function triggerWelcomeEmail(email: string, name: string): Promise<void> {
  const emailServiceUrl = env.EMAIL_SERVICE_URL;
  if (!emailServiceUrl) {
    logger.warn(
      { email },
      'EMAIL_SERVICE_URL not set; welcome email will not be sent',
    );
    return;
  }
  fetch(emailServiceUrl.replace(/\/$/, ''), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  }).catch((err) => logger.error({ err }, 'welcome email failed'));
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  await logActivity({ userId: user.id, action: 'REGISTER', metadata: { email } });
  triggerWelcomeEmail(user.email, user.name);

  res.status(201).json({ user: sanitizeUser(user), token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  await logActivity({ userId: user.id, action: 'LOGIN' });

  res.json({ user: sanitizeUser(user), token });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({ user: sanitizeUser(user) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { ...(name !== undefined && { name }) },
  });

  res.json({ user: sanitizeUser(user) });
});
