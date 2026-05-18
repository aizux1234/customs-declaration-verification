// src/pages/verify/VerifyPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { resetStore, store } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { VerifyPage } from './VerifyPage';

describe('VerifyPage', () => {
  it('shows summary after a successful search', async () => {
    resetStore();
    const known = store.declarations[0].declarationNo;
    render(
      <AuthProvider><MemoryRouter><VerifyPage /></MemoryRouter></AuthProvider>,
    );
    await userEvent.type(screen.getByLabelText(/Reference Number/i), 'REF999');
    await userEvent.type(screen.getByLabelText(/เลขที่ใบขน/), known);
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /ค้นหา/ }));
    });
    expect(await screen.findByText(known)).toBeInTheDocument();
  });

  it('shows a not-found banner for an unknown declaration', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><VerifyPage /></MemoryRouter></AuthProvider>,
    );
    await userEvent.type(screen.getByLabelText(/Reference Number/i), 'REF999');
    await userEvent.type(screen.getByLabelText(/เลขที่ใบขน/), 'ZZZ-000000000000');
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /ค้นหา/ }));
    });
    expect(await screen.findByText(/ไม่พบข้อมูลใบขน/)).toBeInTheDocument();
  });
});
