// src/pages/users/UsersPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { resetStore } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { UsersPage } from './UsersPage';

describe('UsersPage', () => {
  it('lists seeded users and opens the create modal', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><UsersPage /></MemoryRouter></AuthProvider>,
    );
    expect(await screen.findByText('officer01')).toBeInTheDocument();
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /เพิ่มผู้ใช้/ }));
    });
    expect(screen.getByText(/สร้างผู้ใช้งาน|สร้าง User/)).toBeInTheDocument();
  });
});
