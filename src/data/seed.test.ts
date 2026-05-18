// src/data/seed.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { store, resetStore } from './store';

describe('seed data', () => {
  beforeEach(() => resetStore());

  it('seeds all 6 roles across users', () => {
    const roles = new Set(store.users.map((u) => u.role));
    expect(roles.size).toBe(6);
    expect(store.users.length).toBeGreaterThanOrEqual(8);
  });
  it('seeds borrowers, declarations, history, log', () => {
    expect(store.borrowers.length).toBeGreaterThanOrEqual(15);
    expect(store.declarations.length).toBeGreaterThanOrEqual(30);
    expect(store.searchHistory.length).toBeGreaterThanOrEqual(40);
    expect(store.activityLog.length).toBeGreaterThanOrEqual(60);
  });
  it('resetStore restores original counts', () => {
    store.users.pop();
    resetStore();
    expect(store.users.length).toBeGreaterThanOrEqual(8);
  });
  it('every declaration link points to a real borrower', () => {
    for (const link of store.declarationLinks) {
      expect(store.borrowers.some((b) => b.id === link.borrowerId)).toBe(true);
    }
  });
});
