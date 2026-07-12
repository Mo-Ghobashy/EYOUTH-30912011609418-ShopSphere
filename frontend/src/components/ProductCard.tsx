import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../utils/image';
import { BentoCard } from './BentoCard';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <BentoCard padding="sm" className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-bento">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-[20px] bg-canvas">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {product.stock <= 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white">
              Out of stock
            </span>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-ink">{product.name}</h3>
            {product.category && (
              <p className="mt-1 text-xs text-muted">{product.category.name}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-canvas px-3 py-1 text-sm font-semibold text-ink">
            {formatPrice(product.price)}
          </span>
        </div>
      </Link>
    </BentoCard>
  );
}
