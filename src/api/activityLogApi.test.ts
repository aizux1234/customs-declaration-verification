// src/api/activityLogApi.test.ts
import { describe, it, expect } from 'vitest';
import { resetStore, store } from '../data/store';
import { listActivityLog } from './activityLogApi';

describe('activityLogApi', () => {
  it('filters by module', async () => {
    resetStore();
    const rows = await listActivityLog({ module: 'AUTH' });
    expect(rows.every((r) => r.module === 'AUTH')).toBe(true);
  });
  it('returns newest first', async () => {
    resetStore();
    const rows = await listActivityLog({});
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].timestamp >= rows[i].timestamp).toBe(true);
    }
  });
  it('filters by actionType list', async () => {
    resetStore();
    const sample = store.activityLog[0].actionType;
    const rows = await listActivityLog({ actionTypes: [sample] });
    expect(rows.every((r) => r.actionType === sample)).toBe(true);
  });
});
