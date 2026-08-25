import { createHash, randomUUID } from 'crypto';

export interface PaymentResult {
  success: boolean;
  transactionRef: string;
  brand: string;
  last4: string;
}

/**
 * Mock payment gateway.
 *
 * SECURITY NOTES:
 * - The full card number (PAN) is NEVER persisted or logged. It is used only
 *   transiently here to simulate a gateway authorization and derive the
 *   fingerprint/brand. Only the brand and last 4 digits are ever returned.
 * - In production, replace this with a real PSP (e.g. Stripe Elements /
 *   PaymentIntents) so raw card data never reaches this server at all and the
 *   frontend submits a one-time token instead.
 */
export function processPayment(cardNumber: string, cvc: string): Promise<PaymentResult> {
  const last4 = cardNumber.slice(-4);
  const brand = detectBrand(cardNumber);
  const fingerprint = createHash('sha256').update(`${cardNumber}:${cvc}`).digest('hex');

  // Deterministic demo rule: cards ending in "034" are declined so the
  // failure path can be tested.
  const success = !last4.endsWith('034');

  return Promise.resolve({
    success,
    transactionRef: `TXN-${randomUUID()}-${fingerprint.slice(0, 8)}`,
    brand,
    last4,
  });
}

function detectBrand(cardNumber: string): string {
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^5[1-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber)) return 'Mastercard';
  if (/^3[47]/.test(cardNumber)) return 'Amex';
  if (/^6(?:011|5)/.test(cardNumber)) return 'Discover';
  return 'Card';
}
