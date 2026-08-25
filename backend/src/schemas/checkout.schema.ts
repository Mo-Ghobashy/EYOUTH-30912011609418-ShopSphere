import { z } from 'zod';

const cardHolder = z
  .string()
  .trim()
  .min(2, 'Card holder name is too short')
  .max(80, 'Card holder name is too long')
  .regex(/^[\p{L}\p{M}'. -]+$/u, 'Invalid card holder name');

const cardNumber = z
  .string()
  .trim()
  .regex(/^\d{12,19}$/, 'Invalid card number')
  .refine((value) => isValidLuhn(value), 'Invalid card number');

const expiry = z
  .string()
  .trim()
  .regex(/^(0[1-9]|1[0-2])\/(\d{2})$/, 'Expiry must be MM/YY')
  .refine((value) => !isExpired(value), 'Card has expired');

const cvc = z.string().trim().regex(/^\d{3,4}$/, 'Invalid CVC');

export const checkoutSchema = z.object({
  shipping: z.object({
    fullName: z.string().trim().min(2, 'Full name is too short').max(80),
    email: z.string().trim().email('Invalid email').max(120),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s-]{7,20}$/, 'Invalid phone number'),
    address: z.string().trim().min(5, 'Address is too short').max(160),
    city: z.string().trim().min(2, 'City is too short').max(80),
    zip: z.string().trim().regex(/^[\w\s-]{3,10}$/, 'Invalid ZIP code'),
    country: z.string().trim().min(2, 'Country is too short').max(60),
  }),
  payment: z.object({
    cardHolder,
    cardNumber,
    expiry,
    cvc,
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

function isValidLuhn(value: string): boolean {
  let sum = 0;
  let double = false;

  for (let i = value.length - 1; i >= 0; i -= 1) {
    let digit = Number(value[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

function isExpired(value: string): boolean {
  const month = Number(value.slice(0, 2));
  const year = 2000 + Number(value.slice(3));
  // Card is valid through the last day of its expiry month.
  const expiresAt = new Date(year, month, 1);
  return expiresAt <= new Date();
}
