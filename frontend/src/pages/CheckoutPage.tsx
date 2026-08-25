import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/endpoints';
import { queryKeys } from '../api/queryKeys';
import { BentoCard } from '../components/BentoCard';
import { CTAButton } from '../components/CTAButton';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { CheckoutPayload, OrderConfirmation } from '../types';
import { formatPrice } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import { getImageUrl } from '../utils/image';

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 9.99;

const inputClass =
  'w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-sm outline-none focus:border-accent/40';

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhnValid(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d{12,19}$/.test(digits)) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function expiryValid(expiry: string): boolean {
  if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry)) return false;
  const month = Number(expiry.slice(0, 2));
  const year = 2000 + Number(expiry.slice(3));
  return new Date(year, month, 1) > new Date();
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const initialState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  country: '',
  cardHolder: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

export function CheckoutPage() {
  const { items, isLoading, itemCount } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(initialState);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const checkoutMutation = useMutation({
    mutationFn: (payload: CheckoutPayload) =>
      ordersApi.checkout(payload).then((res) => res.data.data),
    onSuccess: (data) => {
      setConfirmation(data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (error) => setFormError(getErrorMessage(error, 'Payment failed')),
  });

  const setField = (field: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    // Client-side validation mirrors the server rules for fast feedback.
    // The server re-validates everything — never rely on client checks.
    if (!luhnValid(form.cardNumber)) {
      setFormError('Please enter a valid card number');
      return;
    }
    if (!expiryValid(form.expiry)) {
      setFormError('Please enter a valid future expiry date');
      return;
    }
    if (!/^\d{3,4}$/.test(form.cvc)) {
      setFormError('Please enter a valid CVC');
      return;
    }

    checkoutMutation.mutate({
      shipping: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        zip: form.zip,
        country: form.country,
      },
      payment: {
        cardHolder: form.cardHolder,
        cardNumber: form.cardNumber.replace(/\s/g, ''),
        expiry: form.expiry,
        cvc: form.cvc,
      },
    });
  };

  const summaryItems = useMemo(
    () =>
      items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <img
            src={getImageUrl(item.product.imageUrl)}
            alt={item.product.name}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{item.product.name}</p>
            <p className="text-xs text-muted">Qty {item.quantity}</p>
          </div>
          <span className="text-sm font-semibold text-ink">
            {formatPrice(item.product.price * item.quantity)}
          </span>
        </li>
      )),
    [items],
  );

  if (confirmation) {
    return (
      <BentoCard padding="lg" className="mx-auto max-w-xl text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="mt-6 text-3xl font-bold text-ink">Payment successful!</h1>
        <p className="mt-2 text-muted">
          Thank you, your order has been placed and is being prepared.
        </p>

        <dl className="mt-8 space-y-3 rounded-bento bg-canvas p-6 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Order ID</dt>
            <dd className="truncate font-medium text-ink">{confirmation.orderId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Transaction ref</dt>
            <dd className="max-w-[55%] truncate text-right text-xs text-ink">
              {confirmation.transactionRef}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-medium text-ink">{formatPrice(Number(confirmation.subtotal))}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping</dt>
            <dd className="font-medium text-ink">{formatPrice(Number(confirmation.shipping))}</dd>
          </div>
          <div className="flex justify-between border-t border-card pt-3 text-base">
            <dt className="font-semibold text-ink">Total paid</dt>
            <dd className="font-bold text-accent">{formatPrice(Number(confirmation.total))}</dd>
          </div>
        </dl>

        <div className="mt-8 flex justify-center gap-3">
          <CTAButton to="/products">Continue shopping</CTAButton>
        </div>
      </BentoCard>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-10 w-48" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <BentoCard padding="lg" className="text-center">
        <h1 className="text-2xl font-bold text-ink">Nothing to check out</h1>
        <p className="mt-2 text-muted">Your cart is empty — add some products first.</p>
        <div className="mt-6 flex justify-center">
          <CTAButton to="/products">Browse products</CTAButton>
        </div>
      </BentoCard>
    );
  }

  return (
    <div className="space-y-6">
      <BentoCard>
        <h1 className="text-3xl font-bold text-ink">Checkout</h1>
        <p className="mt-2 text-sm text-muted">
          Secure checkout — your data is validated on both client and server.
        </p>
      </BentoCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <BentoCard>
            <h2 className="text-lg font-semibold text-ink">Shipping details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-muted">Full name</span>
                <input
                  required
                  minLength={2}
                  value={form.fullName}
                  onChange={(e) => setField('fullName')(e.target.value)}
                  className={inputClass}
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted">Email</span>
                <input
                  required
                  type="email"
                  value={form.email || user?.email || ''}
                  onChange={(e) => setField('email')(e.target.value)}
                  placeholder={user?.email}
                  className={inputClass}
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted">Phone</span>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setField('phone')(e.target.value)}
                  className={inputClass}
                  autoComplete="tel"
                  placeholder="+20 100 000 0000"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-muted">Address</span>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setField('address')(e.target.value)}
                  className={inputClass}
                  autoComplete="street-address"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted">City</span>
                <input
                  required
                  value={form.city}
                  onChange={(e) => setField('city')(e.target.value)}
                  className={inputClass}
                  autoComplete="address-level2"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted">ZIP</span>
                  <input
                    required
                    value={form.zip}
                    onChange={(e) => setField('zip')(e.target.value)}
                    className={inputClass}
                    autoComplete="postal-code"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted">Country</span>
                  <input
                    required
                    value={form.country}
                    onChange={(e) => setField('country')(e.target.value)}
                    className={inputClass}
                    autoComplete="country-name"
                  />
                </label>
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">Payment</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                Encrypted &amp; secure
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              Demo gateway — your full card number is never stored or logged; only
              the brand and last 4 digits are kept with your order.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-muted">
                  Card holder
                </span>
                <input
                  required
                  value={form.cardHolder}
                  onChange={(e) => setField('cardHolder')(e.target.value)}
                  className={inputClass}
                  autoComplete="cc-name"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-muted">Card number</span>
                <input
                  required
                  inputMode="numeric"
                  value={form.cardNumber}
                  onChange={(e) => setField('cardNumber')(formatCardNumber(e.target.value))}
                  className={`${inputClass} font-mono tracking-wider`}
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted">Expiry (MM/YY)</span>
                <input
                  required
                  inputMode="numeric"
                  value={form.expiry}
                  onChange={(e) => setField('expiry')(formatExpiry(e.target.value))}
                  className={inputClass}
                  autoComplete="cc-exp"
                  placeholder="09/29"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted">CVC</span>
                <input
                  required
                  inputMode="numeric"
                  value={form.cvc}
                  onChange={(e) => setField('cvc')(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={inputClass}
                  autoComplete="cc-csc"
                  placeholder="123"
                />
              </label>
            </div>

            {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={checkoutMutation.isPending}
              className="mt-6 w-full rounded-full bg-cta px-6 py-4 text-base font-bold text-ink transition hover:brightness-95 disabled:opacity-60"
            >
              {checkoutMutation.isPending
                ? 'Processing payment...'
                : `Pay ${formatPrice(total)}`}
            </button>

            <p className="mt-3 text-center text-xs text-muted">
              Test cards: any valid Luhn number succeeds · cards ending in{' '}
              <strong>034</strong> get declined
            </p>
          </BentoCard>
        </form>

        <div>
          <BentoCard className="sticky top-6">
            <h2 className="text-lg font-semibold text-ink">Order summary</h2>
            <ul className="mt-4 space-y-3">{summaryItems}</ul>

            <div className="mt-5 space-y-2 border-t border-canvas pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="font-medium text-ink">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-canvas pt-2 text-base">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-bold text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              to="/cart"
              className="mt-4 block text-center text-sm font-medium text-muted hover:text-ink"
            >
              ← Back to cart
            </Link>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
