import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser } from '../types/express';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, env.JWT_SECRET) as AuthUser;
}
