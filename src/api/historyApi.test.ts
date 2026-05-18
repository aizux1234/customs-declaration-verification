// src/api/historyApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { recordSearch, listHistory, hasHistory } from './historyApi';
import type { User, Declaration } from '../types';

const actor: User = {
  id: 'U-001', username: 'officer01', firstName: 'สมชาย', lastName: 'ใจดี',
  email: 'a@b.com', phone: '0812345678', position: 'CO', role: 'CREDIT_OFFICER',
  status: 'ACTIVE', password: 'x', failedLoginCount: 0, lockedUntil: null,
  lastLoginAt: null, createdAt: '2026-01-01', updatedAt: '2026-01-01',
};

describe('historyApi', () => {
  beforeEach(() => resetStore());

  it('recordSearch appends a record', async () => {
    const decl: Declaration = store.declarations[0];
    const before = store.searchHistory.length;
    await recordSearch(actor, decl, 'REFTEST');
    expect(store.searchHistory.length).toBe(before + 1);
  });
  it('hasHistory is true after recording', async () => {
    const decl = store.declarations[0];
    await recordSearch(actor, decl, 'REFTEST');
    expect(await hasHistory(decl.declarationNo)).toBe(true);
  });
  it('listHistory filters by declarationNo', async () => {
    const decl = store.declarations[0];
    await recordSearch(actor, decl, 'REFTEST');
    const rows = await listHistory({ declarationNo: decl.declarationNo });
    expect(rows.every((r) => r.declarationNo === decl.declarationNo)).toBe(true);
  });
});
