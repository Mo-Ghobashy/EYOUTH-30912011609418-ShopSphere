import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BentoCard } from '../components/BentoCard';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(email.trim(), password, name.trim());
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <BentoCard padding="lg">
        <h1 className="text-3xl font-bold text-ink">Create account</h1>
        <p className="mt-2 text-sm text-muted">Join ShopSphere and start shopping</p>

        <form className="mt-8 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block text-sm font-medium text-ink">
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 outline-none focus:border-accent/40"
              autoComplete="name"
            />
            {fieldErrors.name && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.name}</span>
            )}
          </label>

          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 outline-none focus:border-accent/40"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.email}</span>
            )}
          </label>

          <label className="block text-sm font-medium text-ink">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 outline-none focus:border-accent/40"
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.password}</span>
            )}
          </label>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent">
            Sign in
          </Link>
        </p>
      </BentoCard>
    </div>
  );
}

