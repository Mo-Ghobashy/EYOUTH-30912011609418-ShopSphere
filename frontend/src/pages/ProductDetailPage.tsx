import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productsApi, reviewsApi } from '../api/endpoints';
import { queryKeys } from '../api/queryKeys';
import { BentoCard } from '../components/BentoCard';
import { ErrorState } from '../components/ErrorState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import { getImageUrl } from '../utils/image';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id).then((res) => res.data.data),
    enabled: Boolean(id),
  });

  const reviewsQuery = useQuery({
    queryKey: queryKeys.products.reviews(id),
    queryFn: () => reviewsApi.list(id, { limit: 20 }).then((res) => res.data),
    enabled: Boolean(id),
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.create(id, { rating, comment }),
    onSuccess: () => {
      setComment('');
      setRating(5);
      setReviewError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.reviews(id) });
    },
    onError: (error) => setReviewError(getErrorMessage(error)),
  });

  const handleAddToCart = async () => {
    if (!productQuery.data) return;
    setAddingToCart(true);
    setCartMessage(null);
    try {
      await addItem(productQuery.data.id, quantity);
      setCartMessage('Added to cart!');
    } catch (error) {
      setCartMessage(getErrorMessage(error, 'Could not add to cart'));
    } finally {
      setAddingToCart(false);
    }
  };

  if (productQuery.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <LoadingSkeleton className="aspect-square w-full rounded-bento" />
        <div className="space-y-4">
          <LoadingSkeleton className="h-10 w-2/3" />
          <LoadingSkeleton className="h-6 w-1/3" />
          <LoadingSkeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (productQuery.error || !productQuery.data) {
    return <ErrorState onRetry={() => void productQuery.refetch()} />;
  }

  const product = productQuery.data;
  const outOfStock = product.stock <= 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <BentoCard padding="sm">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="aspect-square w-full rounded-[20px] object-cover"
          />
        </BentoCard>

        <BentoCard>
          <p className="text-sm font-medium text-muted">{product.category?.name}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-ink">{formatPrice(product.price)}</p>
          <p className="mt-4 text-muted">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <span
              className={`rounded-full px-3 py-1 font-medium ${
                outOfStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
            </span>
          </div>

          {!outOfStock && user && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                Qty
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-20 rounded-2xl border border-canvas bg-canvas px-3 py-2 outline-none"
                />
              </label>
              <button
                type="button"
                disabled={addingToCart}
                onClick={() => void handleAddToCart()}
                className="rounded-full bg-cta px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-95 disabled:opacity-60"
              >
                {addingToCart ? 'Adding...' : 'Add to cart'}
              </button>
              {cartMessage && (
                <span className="text-sm font-medium text-accent">{cartMessage}</span>
              )}
            </div>
          )}

          {!outOfStock && !user && (
            <p className="mt-8 text-sm text-muted">
              <Link to="/login" className="font-medium text-accent">
                Log in
              </Link>{' '}
              to add items to your cart.
            </p>
          )}
        </BentoCard>
      </div>

      <BentoCard>
        <h2 className="text-xl font-semibold text-ink">Reviews</h2>

        {reviewsQuery.isLoading && <LoadingSkeleton className="mt-4 h-24 w-full" />}

        {reviewsQuery.data && reviewsQuery.data.data.length === 0 && (
          <p className="mt-4 text-sm text-muted">No reviews yet. Be the first!</p>
        )}

        {reviewsQuery.data && reviewsQuery.data.data.length > 0 && (
          <ul className="mt-4 space-y-4">
            {reviewsQuery.data.data.map((review) => (
              <li key={review.id} className="rounded-2xl bg-canvas p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-ink">{review.userName}</p>
                  <p className="text-sm font-semibold text-accent">{review.rating} ★</p>
                </div>
                <p className="mt-2 text-sm text-muted">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}

        {user ? (
          <form
            className="mt-6 space-y-4 border-t border-canvas pt-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (!comment.trim()) {
                setReviewError('Please enter a comment');
                return;
              }
              reviewMutation.mutate();
            }}
          >
            <h3 className="font-medium text-ink">Write a review</h3>
            <label className="block text-sm text-muted">
              Rating
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-ink outline-none"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-muted">
              Comment
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-ink outline-none"
                placeholder="Share your experience..."
              />
            </label>
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            <button
              type="submit"
              disabled={reviewMutation.isPending}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {reviewMutation.isPending ? 'Submitting...' : 'Submit review'}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-muted">
            <Link to="/login" className="font-medium text-accent">
              Log in
            </Link>{' '}
            to leave a review.
          </p>
        )}
      </BentoCard>
    </div>
  );
}
