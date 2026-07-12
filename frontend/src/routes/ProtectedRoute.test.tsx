import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

describe('ProtectedRoute', () => {
  it('redirects guests to login', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<div>Cart content</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      },
      token: 'token',
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<div>Cart content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Cart content')).toBeInTheDocument();
  });
});
