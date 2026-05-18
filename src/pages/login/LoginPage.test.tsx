// src/pages/login/LoginPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { resetStore } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';

function setup() {
  return render(
    <AuthProvider><MemoryRouter><LoginPage /></MemoryRouter></AuthProvider>,
  );
}

describe('LoginPage', () => {
  it('shows an error on wrong credentials', async () => {
    resetStore();
    setup();
    await userEvent.type(screen.getByLabelText(/Username/i), 'officer01');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpass');
    await act(async () => { await userEvent.click(screen.getByRole('button', { name: /เข้าสู่ระบบ/ })); });
    expect(await screen.findByText(/ไม่ถูกต้อง|เหลือ/)).toBeInTheDocument();
  });
});
