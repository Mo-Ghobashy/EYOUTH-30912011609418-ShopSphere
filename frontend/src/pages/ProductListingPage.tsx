import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoriesApi, productsApi } from '../api/endpoints';
import { queryKeys } from '../api/queryKeys';
import { BentoCard } from '../components/BentoCard';
import { ErrorState } from '../components/ErrorState';
import { FilterSidebar, type FilterValues } from '../components/FilterSidebar';
import { Pagination } from '../components/Pagination';
import { ProductGrid } from '../components/ProductGrid';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import type { ProductListParams } from '../types';

const PAGE_SIZE = 12;

function parseFilters(params: URLSearchParams): FilterValues & { page: number } {
  return {
    category: params.get('category') ?? undefined,
    minPrice: params.get('minPrice') ?? undefined,
    maxPrice: params.get('maxPrice') ?? undefined,
    sort: (params.get('sort') as FilterValues['sort']) || 'newest',
    page: Number(params.get('page') ?? '1') || 1,
  };
}

function toQueryParams(
  search: string,
  filters: FilterValues,
  page: number,
): ProductListParams {
  return {
    search: search || undefined,
    category: filters.category,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    sort: filters.sort,
    page,
    limit: PAGE_SIZE,
  };
}

export function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const queryParams = useMemo(
    () => toQueryParams(search, filters, filters.page),
    [search, filters],
  );

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.list().then((res) => res.data.data),
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list(queryParams),
    queryFn: () => productsApi.list(queryParams).then((res) => res.data),
  });

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>, resetPage = true) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      if (resetPage) {
        next.delete('page');
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const handleFilterChange = (values: FilterValues) => {
    updateParams({
      category: values.category,
      minPrice: values.minPrice,
      maxPrice: values.maxPrice,
      sort: values.sort,
    });
  };

  return (
    <div className="space-y-6">
      <BentoCard>
        <h1 className="text-3xl font-bold text-ink">Products</h1>
        <p className="mt-2 text-sm text-muted">
          {search ? `Results for "${search}"` : 'Browse our full collection'}
        </p>
      </BentoCard>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar
          categories={categoriesQuery.data ?? []}
          values={{
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            sort: filters.sort,
          }}
          onChange={handleFilterChange}
        />

        <div className="space-y-6">
          {productsQuery.isLoading && <ProductGridSkeleton count={8} />}

          {productsQuery.error && (
            <ErrorState onRetry={() => void productsQuery.refetch()} />
          )}

          {productsQuery.data && (
            <>
              <ProductGrid
                products={productsQuery.data.data}
                emptyMessage="No products match your filters."
              />
              <Pagination
                page={productsQuery.data.page}
                totalPages={productsQuery.data.totalPages}
                onPageChange={(page) =>
                  updateParams({ page: String(page) }, false)
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
