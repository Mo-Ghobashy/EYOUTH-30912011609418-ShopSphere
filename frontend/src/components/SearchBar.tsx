import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  defaultValue = '',
  placeholder = 'Search products...',
  className = '',
}: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-transparent bg-card py-3.5 pl-5 pr-14 text-sm text-ink shadow-bento-sm outline-none transition placeholder:text-muted focus:border-accent/30"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-white transition hover:bg-gray-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
