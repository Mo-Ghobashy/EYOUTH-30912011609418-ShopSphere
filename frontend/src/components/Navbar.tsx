import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ConfirmModal } from './ConfirmModal';
import { SearchBar } from './SearchBar';

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6H21L19 14H8L6 6ZM6 6L5 3H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
      {initials}
    </span>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((value) => !value)}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink shadow-bento-sm transition hover:bg-canvas"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M7.1 16.9L5 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <header className="px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl space-y-3 rounded-bento-lg bg-canvas/70 p-4 shadow-bento backdrop-blur-sm sm:flex sm:flex-row sm:items-center sm:gap-6 sm:space-y-0 sm:p-5">
        <div className="flex items-center justify-between gap-2 sm:contents">
          <Link to="/" className="shrink-0 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Shop<span className="text-accent">Sphere</span>
          </Link>

          <div className="flex items-center justify-end gap-2 sm:order-last sm:gap-3">
            <ThemeToggle />

            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink shadow-bento-sm transition hover:bg-canvas"
              aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-ink">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-1.5 shadow-bento-sm sm:gap-3 sm:pl-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="hidden text-sm font-medium text-ink min-[420px]:block"
                >
                  {user.name}
                </button>
                <button type="button" onClick={() => navigate('/profile')} aria-label="Profile">
                  <UserAvatar name={user.name} />
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="rounded-full px-2 py-1.5 text-xs font-medium text-muted hover:text-ink sm:px-3"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="rounded-full px-3 py-2 text-sm font-medium text-ink transition hover:bg-card"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 sm:px-4"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <SearchBar />
        </div>
      </div>
    </header>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Log out?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Yes, log out"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
      />
    </>
  );
}
