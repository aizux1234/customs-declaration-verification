// src/data/activityLog.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { store, resetStore } from './store';
import { logActivity } from './activityLog';
import type { User } from '../types';

const actor: User = {
  id: 'U-001', username: 'officer01', firstName: 'สมชาย', lastName: 'ใจดี',
  email: 'a@b.com', phone: '0812345678', position: 'เจ้าหน้าที่สินเชื่อ',
  role: 'CREDIT_OFFICER', status: 'ACTIVE', password: 'x',
  failedLoginCount: 0, lockedUntil: null, lastLoginAt: null,
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
};

describe('logActivity', () => {
  beforeEach(() => resetStore());

  it('prepends a new entry with the actor details', () => {
    const before = store.activityLog.length;
    logActivity(actor, 'VERIFICATION', 'DECLARATION_SEARCHED', 'ค้นหาใบขน X');
    expect(store.activityLog.length).toBe(before + 1);
    expect(store.activityLog[0].username).toBe('officer01');
    expect(store.activityLog[0].actionType).toBe('DECLARATION_SEARCHED');
  });
});
