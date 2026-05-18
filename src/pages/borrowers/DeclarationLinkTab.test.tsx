// src/pages/borrowers/DeclarationLinkTab.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetStore, store } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { DeclarationLinkTab } from './DeclarationLinkTab';

describe('DeclarationLinkTab', () => {
  it('lists existing links for a borrower', async () => {
    resetStore();
    const link = store.declarationLinks[0];
    render(
      <AuthProvider>
        <MemoryRouter>
          <DeclarationLinkTab borrowerId={link.borrowerId} />
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(await screen.findByText(link.declarationNo)).toBeInTheDocument();
  });
});
