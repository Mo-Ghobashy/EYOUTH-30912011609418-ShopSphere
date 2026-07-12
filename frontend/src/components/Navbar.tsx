import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.5C12 20.5 4 14.5 4 9.5C4 6.5 6.5 4.5 9 4.5C10.5 4.5 12 5.5 12 5.5C12 5.5 13.5 4.5 15 4.5C17.5 4.5 20 6.5 20 9.5C20 14.5 12 20.5 12 20.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-bento-lg bg-canvas/70 p-4 shadow-bento backdrop-blur-sm sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <Link to="/" className="shrink-0 text-2xl font-semibold tracking-tight text-ink">
          Store<span className="text-accent">.</span>
        </Link>

        <div className="flex-1">
          <SearchBar />
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link
            to="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink shadow-bento-sm transition hover:bg-white"
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-ink">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink shadow-bento-sm transition hover:bg-white"
            aria-label="Wishlist"
          >
            <HeartIcon />
          </button>

          {user ? (
            <div className="flex items-center gap-3 rounded-full bg-card py-1.5 pl-4 pr-1.5 shadow-bento-sm">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="hidden text-sm font-medium text-ink sm:block"
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
                onClick={logout}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-ink"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-card"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
