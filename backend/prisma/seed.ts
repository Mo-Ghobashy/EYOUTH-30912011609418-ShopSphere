import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DIRECT_DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Wearables', slug: 'wearables' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Gaming', slug: 'gaming' },
];

const products = [
  {
    name: 'Sequoia Inspiring Headphones',
    description: 'Premium over-ear headphones with clear sound and deep bass.',
    price: 249.99,
    stock: 40,
    categorySlug: 'audio',
  },
  {
    name: 'New Gen X-Bud',
    description: 'Compact wireless earbuds with active noise cancellation.',
    price: 129.99,
    stock: 75,
    categorySlug: 'audio',
  },
  {
    name: 'Light Grey Surface Headphone',
    description: 'Lightweight on-ear headphones boosted with bass.',
    price: 89.99,
    stock: 60,
    categorySlug: 'audio',
  },
  {
    name: 'VR Vision Headset',
    description: 'Immersive VR headset for next-gen experiences.',
    price: 399.99,
    stock: 25,
    categorySlug: 'wearables',
  },
  {
    name: 'Pulse Smart Watch',
    description: 'Track fitness, notifications, and health metrics.',
    price: 199.99,
    stock: 50,
    categorySlug: 'wearables',
  },
  {
    name: 'Cube Mini Speaker',
    description: 'Portable Bluetooth speaker with 360-degree sound.',
    price: 59.99,
    stock: 100,
    categorySlug: 'electronics',
  },
  {
    name: 'Nebula 4K Monitor',
    description: '27-inch 4K display with ultra-thin bezels.',
    price: 449.99,
    stock: 30,
    categorySlug: 'electronics',
  },
  {
    name: 'Aero Mechanical Keyboard',
    description: 'RGB mechanical keyboard with tactile switches.',
    price: 149.99,
    stock: 45,
    categorySlug: 'accessories',
  },
  {
    name: 'Glide Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking.',
    price: 49.99,
    stock: 80,
    categorySlug: 'accessories',
  },
  {
    name: 'Thunder Pro Controller',
    description: 'Low-latency gaming controller for PC and console.',
    price: 69.99,
    stock: 55,
    categorySlug: 'gaming',
  },
  {
    name: 'Shadow RGB Mousepad',
    description: 'Extended mousepad with customizable RGB lighting.',
    price: 34.99,
    stock: 90,
    categorySlug: 'gaming',
  },
  {
    name: 'Crystal USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI and fast charging.',
    price: 79.99,
    stock: 65,
    categorySlug: 'accessories',
  },
];

async function main(): Promise<void> {
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const customerPassword = await bcrypt.hash('Customer123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      passwordHash: adminPassword,
      name: 'Store Admin',
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@store.com' },
    update: {},
    create: {
      email: 'customer@store.com',
      passwordHash: customerPassword,
      name: 'Demo Customer',
      role: Role.CUSTOMER,
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  const categoryRecords = await prisma.category.findMany();
  const categoryBySlug = Object.fromEntries(categoryRecords.map((c) => [c.slug, c.id]));

  for (const product of products) {
    const categoryId = categoryBySlug[product.categorySlug];
    if (!categoryId) continue;

    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId,
        },
      });
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
