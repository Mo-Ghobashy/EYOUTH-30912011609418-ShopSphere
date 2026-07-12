import { NextFunction, Request, Response } from 'express';
import { requireAdmin } from '../../src/middleware/rbac';
import { AppError } from '../../src/middleware/errorHandler';

function createMockReq(user?: { id: string; email: string; role: 'ADMIN' | 'CUSTOMER' }) {
  return { user } as Request;
}

function createMockRes() {
  return {} as Response;
}

describe('requireAdmin middleware', () => {
  it('allows admin users', () => {
    const req = createMockReq({
      id: '1',
      email: 'admin@store.com',
      role: 'ADMIN',
    });
    const next = jest.fn() as NextFunction;

    requireAdmin(req, createMockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('blocks customer users', () => {
    const req = createMockReq({
      id: '2',
      email: 'customer@store.com',
      role: 'CUSTOMER',
    });
    const next = jest.fn() as NextFunction;

    requireAdmin(req, createMockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(403);
  });

  it('blocks unauthenticated requests', () => {
    const req = createMockReq();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, createMockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });
});
