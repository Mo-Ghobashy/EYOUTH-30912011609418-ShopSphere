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
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description:
      'Industry-leading noise cancellation with two processors, 8 microphones, and up to 30 hours of battery life. Exceptional call clarity and premium comfort.',
    price: 399.99,
    stock: 35,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Apple AirPods Pro (2nd Gen)',
    description:
      'Active noise cancellation, Adaptive Transparency, personalized spatial audio, and the MagSafe charging case with up to 30 hours of listening time.',
    price: 249.0,
    stock: 60,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Bose QuietComfort Ultra Headphones',
    description:
      'Flagship wireless headphones with world-class noise cancellation, immersive spatial audio, and 24 hours of battery life in a lightweight design.',
    price: 429.0,
    stock: 20,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Audio-Technica ATH-M50x',
    description:
      'Professional studio monitor headphones with critically acclaimed sound, 90-degree swiveling earcups, and detachable cables.',
    price: 169.0,
    stock: 40,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'JBL Tune 510BT On-Ear Headphones',
    description:
      'Wireless on-ear headphones with JBL Pure Bass sound, up to 40 hours of battery, and fast charging — 10 minutes gives you 2 more hours.',
    price: 49.95,
    stock: 100,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Sony WF-1000XM5 Earbuds',
    description:
      'The smallest and lightest noise-canceling earbuds from Sony with industry-leading ANC, 8 hours per charge, and LDAC hi-res audio support.',
    price: 299.99,
    stock: 45,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Beats Studio Pro',
    description:
      'Premium wireless headphones with fully adaptive noise cancellation, personalized spatial audio, and lossless audio via USB-C. Up to 40 hours of playback.',
    price: 349.99,
    stock: 25,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Marshall Major IV',
    description:
      'Iconic on-ear Bluetooth headphones with over 80 hours of playtime, wireless charging, and the signature Marshall sound with deep bass.',
    price: 149.99,
    stock: 50,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Anker Soundcore Space Q45',
    description:
      'Adaptive active noise cancellation that adjusts to your surroundings, 50-hour playtime, and hi-res LDAC audio support.',
    price: 129.99,
    stock: 70,
    categorySlug: 'audio',
    imageUrl:
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'SteelSeries Arctis Nova 7 Gaming Headset',
    description:
      'Wireless gaming headset with simultaneous 2.4GHz + Bluetooth, ClearCast Gen 2 mic, and 38-hour battery for PC, PlayStation, and mobile.',
    price: 179.99,
    stock: 30,
    categorySlug: 'gaming',
    imageUrl:
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'JBL Charge 5 Portable Speaker',
    description:
      'Portable waterproof Bluetooth speaker with bold JBL Pro Sound, deep bass, 20 hours of playtime, and a built-in power bank.',
    price: 179.95,
    stock: 55,
    categorySlug: 'electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Apple Watch Series 9',
    description:
      'Brighter Always-On Retina display, double-tap gesture, advanced health sensors, and up to 18 hours of battery life.',
    price: 399.0,
    stock: 28,
    categorySlug: 'wearables',
    imageUrl:
      'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80&auto=format&fit=crop',
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

  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();

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
          imageUrl: product.imageUrl ?? null,
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
          imageUrl: product.imageUrl ?? null,
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
