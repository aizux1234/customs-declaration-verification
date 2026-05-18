// src/pages/borrowers/BorrowersPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetStore, store } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { BorrowersPage } from './BorrowersPage';

describe('BorrowersPage', () => {
  it('lists seeded borrowers', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><BorrowersPage /></MemoryRouter></AuthProvider>,
    );
    expect(await screen.findByText(store.borrowers[0].nameTh)).toBeInTheDocument();
  });
});
