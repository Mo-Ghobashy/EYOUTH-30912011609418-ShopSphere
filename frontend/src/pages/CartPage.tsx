import { Link } from 'react-router-dom';
import { BentoCard } from '../components/BentoCard';
import { CTAButton } from '../components/CTAButton';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../utils/image';

export function CartPage() {
  const { items, isLoading, updateQuantity, removeItem, itemCount } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-10 w-48" />
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-32 w-full" />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <BentoCard padding="lg" className="text-center">
        <h1 className="text-3xl font-bold text-ink">Your cart is empty</h1>
        <p className="mt-3 text-muted">Discover products and add them to your cart.</p>
        <div className="mt-8 flex justify-center">
          <CTAButton to="/products">Start shopping</CTAButton>
        </div>
      </BentoCard>
    );
  }

  return (
    <div className="space-y-6">
      <BentoCard>
        <h1 className="text-3xl font-bold text-ink">Shopping Cart</h1>
        <p className="mt-2 text-sm text-muted">{itemCount} items</p>
      </BentoCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <BentoCard key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img
                src={getImageUrl(item.product.imageUrl)}
                alt={item.product.name}
                className="h-24 w-24 rounded-2xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${item.product.id}`}
                  className="text-lg font-semibold text-ink hover:text-accent"
                >
                  {item.product.name}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {formatPrice(item.product.price)} each
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    void updateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-lg font-medium"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    void updateQuantity(
                      item.id,
                      Math.min(item.product.stock, item.quantity + 1),
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-lg font-medium"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="font-semibold text-ink">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
                <button
                  type="button"
                  onClick={() => void removeItem(item.id)}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </BentoCard>
          ))}
        </div>

        <BentoCard className="h-fit">
          <h2 className="text-lg font-semibold text-ink">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            {subtotal >= 50
              ? 'You qualify for free shipping!'
              : `Free shipping on orders over $50 — add ${formatPrice(50 - subtotal)} more.`}
          </p>

          <div className="mt-6 space-y-3">
            <CTAButton to="/checkout" className="w-full justify-center">
              Proceed to payment
            </CTAButton>
            <CTAButton to="/products" variant="dark" className="w-full justify-center">
              Continue shopping
            </CTAButton>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v11H5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            Secure checkout — encrypted payment
          </p>
        </BentoCard>
      </div>
    </div>
  );
}
