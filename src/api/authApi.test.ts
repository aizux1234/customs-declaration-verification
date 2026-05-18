// src/api/authApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { login } from './authApi';

describe('authApi.login', () => {
  beforeEach(() => resetStore());

  it('logs in with correct credentials', async () => {
    const r = await login('officer01', 'Passw0rd!');
    expect(r.ok).toBe(true);
  });
  it('rejects wrong password and increments counter', async () => {
    const r = await login('officer01', 'wrong');
    expect(r.ok).toBe(false);
    const u = store.users.find((x) => x.username === 'officer01')!;
    expect(u.failedLoginCount).toBe(1);
  });
  it('locks the account after 5 failures', async () => {
    for (let i = 0; i < 5; i++) await login('officer01', 'wrong');
    const r = await login('officer01', 'Passw0rd!');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('LOCKED');
  });
});
