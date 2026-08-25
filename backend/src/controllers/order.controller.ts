import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { CheckoutInput } from '../schemas/checkout.schema';
import { logActivity } from '../services/activityLog.service';
import { processPayment } from '../services/payment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { param } from '../utils/params';

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 9.99;

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const { shipping, payment } = req.body as CheckoutInput;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: { product: true },
    orderBy: { id: 'asc' },
  });

  if (cartItems.length === 0) {
    throw new AppError(400, 'Your cart is empty');
  }

  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      throw new AppError(
        409,
        `Insufficient stock for "${item.product.name}" (${item.product.stock} left)`,
      );
    }
  }

  // Totals are computed SERVER-SIDE from database prices — never trust
  // amounts sent by the client.
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  // Simulated gateway authorization. Only brand + last4 survive this call.
  const paymentResult = await processPayment(payment.cardNumber, payment.cvc);

  if (!paymentResult.success) {
    throw new AppError(402, 'Payment declined by your bank. Please try another card.');
  }

  const order = await prisma.$transaction(async (tx) => {
    // Re-check stock inside the transaction to prevent race conditions.
    for (const item of cartItems) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new AppError(409, `Insufficient stock for "${item.product.name}"`);
      }
    }

    return tx.order.create({
      data: {
        userId: req.user!.id,
        status: 'PAID',
        subtotal,
        shipping: shippingFee,
        total,
        fullName: shipping.fullName,
        email: shipping.email,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        zip: shipping.zip,
        country: shipping.country,
        cardBrand: paymentResult.brand,
        cardLast4: paymentResult.last4,
        transactionRef: paymentResult.transactionRef,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  });

  await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });

  await logActivity({
    userId: req.user!.id,
    action: 'ORDER_PLACED',
    metadata: { orderId: order.id, total },
  });

  res.status(201).json({
    data: {
      orderId: order.id,
      status: order.status,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      transactionRef: order.transactionRef,
      createdAt: order.createdAt,
    },
  });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: param(req.params.id), userId: req.user!.id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  res.json({ data: order });
});
