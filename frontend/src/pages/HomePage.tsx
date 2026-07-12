import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productsApi } from '../api/endpoints';
import { queryKeys } from '../api/queryKeys';
import { BentoCard } from '../components/BentoCard';
import { CTAButton } from '../components/CTAButton';
import { ErrorState } from '../components/ErrorState';
import { ProductGrid } from '../components/ProductGrid';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../utils/image';

const swatches = ['#2563EB', '#F97316', '#22C55E', '#EF4444', '#38BDF8'];

export function HomePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.products.list({ limit: 4, sort: 'newest' }),
    queryFn: () => productsApi.list({ limit: 4, sort: 'newest' }).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <BentoCard padding="lg" className="min-h-[320px] animate-pulse bg-canvas" />
          <div className="grid gap-4">
            <BentoCard className="min-h-[120px] animate-pulse bg-canvas" />
            <BentoCard className="min-h-[180px] animate-pulse bg-canvas" />
          </div>
        </div>
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  const products = data?.data ?? [];
  const featured = products[0];
  const newest = products[1];
  const popular = products[2];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <BentoCard padding="lg" className="relative overflow-hidden">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-canvas px-4 py-1.5 text-xs font-medium text-muted">
                Music is Classic
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">
                {featured ? featured.name : 'Discover Premium Audio'}
              </h1>
              <p className="mt-4 max-w-md text-muted">
                {featured?.description ??
                  'Clear sounds. Making your dream music come true — stay with premium gear from Store.'}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <CTAButton to="/products">View All Products</CTAButton>
                {featured && (
                  <span className="text-lg font-semibold text-ink">
                    {formatPrice(featured.price)}
                  </span>
                )}
              </div>
            </div>

            {featured && (
              <img
                src={getImageUrl(featured.imageUrl)}
                alt={featured.name}
                className="mx-auto h-56 w-56 rounded-[32px] object-cover shadow-bento lg:h-64 lg:w-64"
              />
            )}
          </div>

          <div className="pointer-events-none absolute -right-8 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl lg:block" />
        </BentoCard>

        <div className="grid gap-4">
          <BentoCard>
            <p className="text-sm font-medium text-muted">Popular Colors</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {swatches.map((color) => (
                <span
                  key={color}
                  className="h-10 w-10 rounded-full border-4 border-card shadow-bento-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </BentoCard>

          {newest ? (
            <BentoCard className="flex min-h-[180px] flex-col justify-between bg-gradient-to-br from-card to-canvas">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">New</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{newest.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{newest.description}</p>
              </div>
              <CTAButton to={`/products/${newest.id}`} className="mt-4 w-fit px-4 py-2 text-xs">
                Explore
              </CTAButton>
            </BentoCard>
          ) : (
            <BentoCard className="min-h-[180px] bg-gradient-to-br from-card to-canvas" />
          )}

          {popular && (
            <BentoCard className="relative overflow-hidden">
              <img
                src={getImageUrl(popular.imageUrl)}
                alt={popular.name}
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
              <div className="relative">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Featured</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{popular.name}</h3>
                <p className="mt-2 text-sm text-muted">Boosted with bass.</p>
                <Link
                  to={`/products/${popular.id}`}
                  className="mt-4 inline-block text-sm font-semibold text-accent"
                >
                  View details →
                </Link>
              </div>
            </BentoCard>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BentoCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">More Products</h2>
              <p className="text-sm text-muted">{data?.total ?? 0} items available</p>
            </div>
            <CTAButton to="/products" className="px-4 py-2 text-xs">
              Shop all
            </CTAButton>
          </div>
          <ProductGrid products={products} />
        </BentoCard>

        <div className="grid gap-4">
          <BentoCard>
            <p className="text-sm text-muted">Community</p>
            <p className="mt-2 text-3xl font-bold text-accent">5m+</p>
            <p className="text-sm font-medium text-ink">Downloads</p>
            <p className="mt-4 text-sm text-muted">4.6 average reviews</p>
          </BentoCard>

          <BentoCard className="bg-gradient-to-b from-card to-accent/5">
            <span className="rounded-full bg-cta px-3 py-1 text-xs font-semibold text-ink">
              Popular
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink">Listening Has Been Released</h3>
            <p className="mt-2 text-sm text-muted">Discover the latest audio experience.</p>
            <p className="mt-6 text-2xl font-bold text-ink">4.7 ★</p>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
