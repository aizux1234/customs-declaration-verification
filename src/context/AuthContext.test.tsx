// src/context/AuthContext.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { resetStore } from '../data/store';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const { user, signIn } = useAuth();
  return (
    <div>
      <span data-testid="who">{user ? user.username : 'none'}</span>
      <button onClick={() => signIn('officer01', 'Passw0rd!')}>login</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('signIn sets the current user', async () => {
    resetStore();
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('who').textContent).toBe('none');
    await act(async () => { screen.getByText('login').click(); });
    await waitFor(() =>
      expect(screen.getByTestId('who').textContent).toBe('officer01'));
  });
});
