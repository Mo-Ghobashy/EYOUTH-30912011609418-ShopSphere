import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../services/activityLog.service';
import { asyncHandler } from '../utils/asyncHandler';
import { formatProduct } from '../utils/product';
import { param } from '../utils/params';
import { productListQuerySchema } from '../schemas/product.schema';

function buildOrderBy(sort: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'price_asc':
      return { price: 'asc' };
    case 'price_desc':
      return { price: 'desc' };
    case 'name':
      return { name: 'asc' };
    default:
      return { createdAt: 'desc' };
  }
}

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = productListQuerySchema.parse(req.query);
  const { search, category, minPrice, maxPrice, sort, page, limit } = query;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: buildOrderBy(sort),
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: products.map(formatProduct),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: param(req.params.id) },
    include: { category: true },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  res.json({ data: formatProduct(product) });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, stock, categoryId } = req.body;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new AppError(400, 'Invalid category');
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const product = await prisma.product.create({
    data: { name, description, price, stock, categoryId, imageUrl },
    include: { category: true },
  });

  await logActivity({
    userId: req.user!.id,
    action: 'PRODUCT_CREATE',
    metadata: { productId: product.id, name: product.name },
  });

  res.status(201).json({ data: formatProduct(product) });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { name, description, price, stock, categoryId } = req.body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Product not found');
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new AppError(400, 'Invalid category');
    }
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(categoryId !== undefined && { categoryId }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
    include: { category: true },
  });

  await logActivity({
    userId: req.user!.id,
    action: 'PRODUCT_UPDATE',
    metadata: { productId: product.id },
  });

  res.json({ data: formatProduct(product) });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = param(req.params.id);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Product not found');
  }

  await prisma.product.delete({ where: { id } });

  await logActivity({
    userId: req.user!.id,
    action: 'PRODUCT_DELETE',
    metadata: { productId: id },
  });

  res.status(204).send();
});
