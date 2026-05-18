// src/pages/activity-log/ActivityLogPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetStore } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { ActivityLogPage } from './ActivityLogPage';

describe('ActivityLogPage', () => {
  it('renders seeded log entries', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><ActivityLogPage /></MemoryRouter></AuthProvider>,
    );
    expect(await screen.findByText(/IP Address/i)).toBeInTheDocument();
  });
});
