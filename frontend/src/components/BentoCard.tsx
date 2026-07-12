import type { ReactNode } from 'react';

interface BentoCardProps {
  children?: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function BentoCard({ children, className = '', padding = 'md' }: BentoCardProps) {
  return (
    <div
      className={`rounded-bento bg-card shadow-bento ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
