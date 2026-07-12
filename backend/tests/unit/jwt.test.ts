import jwt from 'jsonwebtoken';
import { signToken, verifyToken } from '../../src/utils/jwt';

describe('jwt utils', () => {
  const payload = {
    id: 'user-1',
    email: 'test@test.com',
    role: 'CUSTOMER' as const,
  };

  it('signs and verifies a valid token', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('rejects an expired token', () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '-1s' });

    expect(() => verifyToken(token)).toThrow();
  });

  it('rejects an invalid token', () => {
    expect(() => verifyToken('not-a-valid-token')).toThrow();
  });
});
