// src/api/customsApi.test.ts
import { describe, it, expect } from 'vitest';
import { store } from '../data/store';
import { searchDeclaration } from './customsApi';

describe('customsApi.searchDeclaration', () => {
  it('returns a known declaration', async () => {
    const known = store.declarations[0].declarationNo;
    const r = await searchDeclaration(known);
    expect(r.ok).toBe(true);
  });
  it('returns NOT_FOUND for unknown numbers', async () => {
    const r = await searchDeclaration('ZZZ-000000000000');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('NOT_FOUND');
  });
  it('returns TIMEOUT for the timeout sentinel', async () => {
    const r = await searchDeclaration('TIMEOUT000000');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('TIMEOUT');
  });
});
