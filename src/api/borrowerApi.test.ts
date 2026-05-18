// src/api/borrowerApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { listBorrowers, getBorrower, createBorrower, deactivateBorrower } from './borrowerApi';

const admin = () => store.users.find((u) => u.role === 'SUPER_ADMIN')!;
const input = {
  nameTh: 'บริษัท ทดสอบ จำกัด', nameEn: 'Test Co', taxId: '9999999999999',
  borrowerType: 'JURISTIC' as const, contactName: 'ผู้ติดต่อ', phone: '0811111111',
  email: 't@b.com', creditLimit: 500000, consentGiven: true,
};

describe('borrowerApi', () => {
  beforeEach(() => resetStore());

  it('createBorrower appends and generates BR id', async () => {
    const b = await createBorrower(admin(), input);
    expect(b.id).toMatch(/^BR-\d{5}$/);
  });
  it('createBorrower rejects duplicate taxId', async () => {
    const existing = store.borrowers[0].taxId;
    await expect(createBorrower(admin(), { ...input, taxId: existing }))
      .rejects.toThrow();
  });
  it('getBorrower returns by id', async () => {
    const id = store.borrowers[0].id;
    expect((await getBorrower(id))?.id).toBe(id);
  });
  it('deactivateBorrower sets INACTIVE', async () => {
    const id = store.borrowers[0].id;
    await deactivateBorrower(admin(), id);
    expect(store.borrowers.find((b) => b.id === id)!.status).toBe('INACTIVE');
  });
  it('listBorrowers filters by type', async () => {
    const rows = await listBorrowers({ borrowerType: 'INDIVIDUAL' });
    expect(rows.every((b) => b.borrowerType === 'INDIVIDUAL')).toBe(true);
  });
});
