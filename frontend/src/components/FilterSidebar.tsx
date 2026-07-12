import type { Category } from '../types';
import { BentoCard } from './BentoCard';

export interface FilterValues {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort: 'newest' | 'price_asc' | 'price_desc' | 'name';
}

interface FilterSidebarProps {
  categories: Category[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

export function FilterSidebar({ categories, values, onChange }: FilterSidebarProps) {
  const update = (patch: Partial<FilterValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <BentoCard className="h-fit">
      <h2 className="text-lg font-semibold text-ink">Filters</h2>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">Category</span>
          <select
            value={values.category ?? ''}
            onChange={(event) =>
              update({ category: event.target.value || undefined })
            }
            className="w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-sm outline-none focus:border-accent/40"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">Min price</span>
            <input
              type="number"
              min="0"
              value={values.minPrice ?? ''}
              onChange={(event) => update({ minPrice: event.target.value || undefined })}
              className="w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-sm outline-none focus:border-accent/40"
              placeholder="0"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">Max price</span>
            <input
              type="number"
              min="0"
              value={values.maxPrice ?? ''}
              onChange={(event) => update({ maxPrice: event.target.value || undefined })}
              className="w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-sm outline-none focus:border-accent/40"
              placeholder="999"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">Sort by</span>
          <select
            value={values.sort}
            onChange={(event) =>
              update({ sort: event.target.value as FilterValues['sort'] })
            }
            className="w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-sm outline-none focus:border-accent/40"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
    </BentoCard>
  );
}
