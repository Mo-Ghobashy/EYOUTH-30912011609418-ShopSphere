import { Prisma } from '@prisma/client';

type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export function formatProduct(product: ProductWithCategory | Prisma.ProductGetPayload<object>) {
  const category = 'category' in product ? product.category : undefined;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    createdAt: product.createdAt,
    ...(category && { category }),
  };
}
