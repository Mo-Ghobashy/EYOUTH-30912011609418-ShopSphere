import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../services/activityLog.service';
import { asyncHandler } from '../utils/asyncHandler';
import { formatProduct } from '../utils/product';
import { param } from '../utils/params';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: { product: { include: { category: true } } },
    orderBy: { id: 'asc' },
  });

  const formatted = items.map((item) => ({
    ...item,
    product: formatProduct(item.product),
  }));

  res.json({ data: formatted });
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  if (product.stock < quantity) {
    throw new AppError(400, 'Insufficient stock');
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user!.id, productId } },
    update: { quantity },
    create: { userId: req.user!.id, productId, quantity },
    include: { product: { include: { category: true } } },
  });

  await logActivity({
    userId: req.user!.id,
    action: 'CART_ADD',
    metadata: { productId, quantity },
  });

  res.json({ data: { ...item, product: formatProduct(item.product) } });
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const itemId = param(req.params.itemId);
  const { quantity } = req.body;

  const existing = await prisma.cartItem.findFirst({
    where: { id: itemId, userId: req.user!.id },
    include: { product: true },
  });

  if (!existing) {
    throw new AppError(404, 'Cart item not found');
  }

  if (existing.product.stock < quantity) {
    throw new AppError(400, 'Insufficient stock');
  }

  const item = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: { include: { category: true } } },
  });

  res.json({ data: { ...item, product: formatProduct(item.product) } });
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const itemId = param(req.params.itemId);

  const existing = await prisma.cartItem.findFirst({
    where: { id: itemId, userId: req.user!.id },
  });

  if (!existing) {
    throw new AppError(404, 'Cart item not found');
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  await logActivity({
    userId: req.user!.id,
    action: 'CART_REMOVE',
    metadata: { productId: existing.productId },
  });

  res.status(204).send();
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });
  res.status(204).send();
});
