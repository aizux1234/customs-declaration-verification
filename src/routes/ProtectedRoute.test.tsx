// src/routes/ProtectedRoute.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('redirects to /login when no user is signed in', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/users']}>
          <Routes>
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
            <Route element={<ProtectedRoute module="users" />}>
              <Route path="/users" element={<div>USERS PAGE</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });
});
