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

const perks = [
  {
    title: 'Free Shipping',
    description: 'On every order over $50, delivered in 2–4 days.',
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: '2-Year Warranty',
    description: 'Every product covered with hassle-free protection.',
    iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '30-Day Returns',
    description: 'Changed your mind? Send it back, no questions asked.',
    iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10a8 8 0 1 1 2.3 5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 5v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

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
                Welcome to ShopSphere
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-ink sm:text-5xl">
                {featured ? featured.name : 'Discover Premium Audio at ShopSphere'}
              </h1>
              <p className="mt-4 max-w-md text-muted">
                {featured?.description ??
                  'Clear sounds. Making your dream music come true — shop premium gear at ShopSphere.'}
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
                className="mx-auto h-44 w-44 rounded-[32px] object-cover shadow-bento sm:h-56 sm:w-56 lg:h-64 lg:w-64"
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
      <div className="grid gap-4 sm:grid-cols-3">
        {perks.map((perk) => (
          <BentoCard key={perk.title} className="flex items-start gap-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${perk.iconClass}`}>
              {perk.icon}
            </span>
            <span>
              <p className="font-semibold text-ink">{perk.title}</p>
              <p className="mt-1 text-sm text-muted">{perk.description}</p>
            </span>
          </BentoCard>
        ))}
      </div>

      <BentoCard padding="lg" className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 text-white">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Sound. Style. Sphere.
          </h2>
          <p className="mt-4 leading-relaxed text-white/85">
            ShopSphere brings the world&apos;s best audio and tech into one place. From
            studio-grade headphones to everyday earbuds, we curate gear that makes
            every moment sound better — backed by fast shipping, real warranties,
            and support that actually answers.
          </p>
          <CTAButton to="/products" className="mt-8">
            Start exploring
          </CTAButton>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      </BentoCard>

      <BentoCard padding="lg" className="relative overflow-hidden bg-gradient-to-br from-lime-50 via-card to-amber-50 dark:from-lime-950/30 dark:via-card dark:to-amber-950/20">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-2xl font-bold text-ink">Never miss a drop</h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              Join the ShopSphere list for early access to new releases, exclusive
              offers, and member-only deals.
            </p>
          </div>
          <form
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row lg:w-auto"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              aria-label="Email address"
              className="w-full min-w-0 rounded-full border border-canvas bg-canvas px-5 py-3 text-sm outline-none focus:border-accent/40"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Subscribe
            </button>
          </form>
        </div>
      </BentoCard>
    </div>
  );
}

