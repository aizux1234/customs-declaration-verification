// src/api/userApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { listUsers, createUser, updateUser, deactivateUser } from './userApi';

const admin = () => store.users.find((u) => u.role === 'ADMIN')!;
const newUserInput = {
  username: 'newuser01', firstName: 'ทดสอบ', lastName: 'ระบบ',
  email: 'new@b.com', phone: '0899999999', position: 'เจ้าหน้าที่',
  role: 'CREDIT_OFFICER' as const, password: 'Passw0rd!',
};

describe('userApi', () => {
  beforeEach(() => resetStore());

  it('listUsers filters by role', async () => {
    const rows = await listUsers({ role: 'AUDITOR' });
    expect(rows.every((u) => u.role === 'AUDITOR')).toBe(true);
  });
  it('createUser appends a user', async () => {
    const before = store.users.length;
    await createUser(admin(), newUserInput);
    expect(store.users.length).toBe(before + 1);
  });
  it('createUser rejects duplicate username', async () => {
    await expect(createUser(admin(), { ...newUserInput, username: 'admin01' }))
      .rejects.toThrow();
  });
  it('deactivateUser sets status INACTIVE', async () => {
    const target = store.users.find((u) => u.role === 'AUDITOR')!;
    await deactivateUser(admin(), target.id);
    expect(store.users.find((u) => u.id === target.id)!.status).toBe('INACTIVE');
  });
  it('deactivateUser rejects self-deactivation', async () => {
    const a = admin();
    await expect(deactivateUser(a, a.id)).rejects.toThrow();
  });
  it('updateUser changing role logs ROLE_CHANGED', async () => {
    const target = store.users.find((u) => u.role === 'AUDITOR')!;
    await updateUser(admin(), target.id, { role: 'CREDIT_OFFICER' });
    expect(store.activityLog.some((l) => l.actionType === 'ROLE_CHANGED')).toBe(true);
  });
});
