// src/pages/reports/SearchHistoryPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetStore } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { SearchHistoryPage } from './SearchHistoryPage';

describe('SearchHistoryPage', () => {
  it('renders the report table with seeded history', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><SearchHistoryPage /></MemoryRouter></AuthProvider>,
    );
    expect(await screen.findByText(/Reference Number/i)).toBeInTheDocument();
  });
});
