// src/pages/verify/TransactionTable.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { resetStore, store } from '../../data/store';
import { TransactionTable } from './TransactionTable';

describe('TransactionTable', () => {
  it('renders one row per line item and the row count', () => {
    resetStore();
    const decl = store.declarations[0];
    render(<TransactionTable declaration={decl} />);
    expect(screen.getByText(decl.lineItems[0].productName)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`แสดง ${decl.lineItems.length} รายการ`)))
      .toBeInTheDocument();
  });
});
