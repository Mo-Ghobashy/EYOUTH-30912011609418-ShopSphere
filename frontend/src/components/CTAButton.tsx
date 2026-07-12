import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  to?: string;
  variant?: 'primary' | 'dark';
}

function ArrowIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 17L17 7M17 7H9M17 7V15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function CTAButton({
  children,
  to,
  variant = 'primary',
  className = '',
  ...props
}: CTAButtonProps) {
  const baseClass =
    variant === 'primary'
      ? 'bg-cta text-ink hover:brightness-95'
      : 'bg-ink text-white hover:bg-gray-800';

  const classes = `inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition ${baseClass} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      <ArrowIcon />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
