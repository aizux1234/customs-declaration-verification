// src/api/declarationApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { listLinksByBorrower, linkDeclaration, unlinkDeclaration } from './declarationApi';

const admin = () => store.users.find((u) => u.role === 'SUPER_ADMIN')!;

describe('declarationApi', () => {
  beforeEach(() => resetStore());

  it('linkDeclaration adds a link', async () => {
    const borrowerId = store.borrowers[0].id;
    const before = store.declarationLinks.length;
    await linkDeclaration(admin(), borrowerId, 'NEW-DECL-0001', 'doc.pdf');
    expect(store.declarationLinks.length).toBe(before + 1);
  });
  it('linkDeclaration rejects a duplicate link for the same borrower', async () => {
    const borrowerId = store.borrowers[0].id;
    await linkDeclaration(admin(), borrowerId, 'DUP-0001', 'doc.pdf');
    await expect(linkDeclaration(admin(), borrowerId, 'DUP-0001', 'doc.pdf'))
      .rejects.toThrow();
  });
  it('unlinkDeclaration removes the link', async () => {
    const borrowerId = store.borrowers[0].id;
    const link = await linkDeclaration(admin(), borrowerId, 'TMP-0001', 'doc.pdf');
    await unlinkDeclaration(admin(), link.id);
    expect(store.declarationLinks.some((l) => l.id === link.id)).toBe(false);
  });
  it('listLinksByBorrower returns only that borrower links', async () => {
    const borrowerId = store.borrowers[0].id;
    const rows = await listLinksByBorrower(borrowerId);
    expect(rows.every((l) => l.borrowerId === borrowerId)).toBe(true);
  });
});
