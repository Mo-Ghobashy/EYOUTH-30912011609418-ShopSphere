import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';
import { param } from '../utils/params';

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json({ data: categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug } = req.body;

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError(409, 'Category slug already exists');
  }

  const category = await prisma.category.create({ data: { name, slug } });
  res.status(201).json({ data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { name, slug } = req.body;

  if (slug) {
    const existing = await prisma.category.findFirst({ where: { slug, NOT: { id } } });
    if (existing) {
      throw new AppError(409, 'Category slug already exists');
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: { ...(name !== undefined && { name }), ...(slug !== undefined && { slug }) },
  });

  res.json({ data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = param(req.params.id);

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new AppError(400, 'Cannot delete category with existing products');
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
});
