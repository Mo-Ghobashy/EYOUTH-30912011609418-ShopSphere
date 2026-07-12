import { useEffect, useState } from 'react';
import { BentoCard } from '../components/BentoCard';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile(name.trim());
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg">
      <BentoCard padding="lg">
        <h1 className="text-3xl font-bold text-ink">Profile</h1>
        <p className="mt-2 text-sm text-muted">Manage your account details</p>

        <form className="mt-8 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block text-sm font-medium text-ink">
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 outline-none focus:border-accent/40"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              value={user.email}
              readOnly
              className="mt-2 w-full cursor-not-allowed rounded-2xl border border-canvas bg-canvas/70 px-4 py-3 text-muted outline-none"
            />
          </label>

          {message && (
            <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
          )}
          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </BentoCard>
    </div>
  );
}
