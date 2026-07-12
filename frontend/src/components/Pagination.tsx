interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (value) =>
      value === 1 ||
      value === totalPages ||
      (value >= page - 1 && value <= page + 1),
  );

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-full bg-card px-4 py-2 text-sm font-medium shadow-bento-sm transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>

      {pages.map((value, index) => {
        const prev = pages[index - 1];
        const showEllipsis = prev !== undefined && value - prev > 1;

        return (
          <span key={value} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-muted">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(value)}
              className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                value === page
                  ? 'bg-ink text-white'
                  : 'bg-card text-ink shadow-bento-sm hover:bg-canvas'
              }`}
            >
              {value}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-full bg-card px-4 py-2 text-sm font-medium shadow-bento-sm transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
