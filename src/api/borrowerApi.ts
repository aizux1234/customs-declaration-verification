// src/api/borrowerApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User, Borrower, BorrowerType, EntityStatus } from '../types';

export interface BorrowerFilter {
  query?: string; status?: EntityStatus; borrowerType?: BorrowerType;
}
export interface NewBorrowerInput {
  nameTh: string; nameEn: string; taxId: string; borrowerType: BorrowerType;
  contactName: string; phone: string; email: string;
  creditLimit: number; consentGiven: boolean;
}

let borrowerSeq = 15;
function nextBorrowerId(): string {
  borrowerSeq += 1;
  return `BR-${String(borrowerSeq).padStart(5, '0')}`;
}

export function listBorrowers(filter: BorrowerFilter = {}): Promise<Borrower[]> {
  let rows = [...store.borrowers];
  if (filter.query) {
    const q = filter.query.toLowerCase();
    rows = rows.filter((b) =>
      b.nameTh.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q) ||
      b.taxId.includes(q) || b.id.toLowerCase().includes(q));
  }
  if (filter.status) rows = rows.filter((b) => b.status === filter.status);
  if (filter.borrowerType) rows = rows.filter((b) => b.borrowerType === filter.borrowerType);
  return delay(rows);
}

export function getBorrower(id: string): Promise<Borrower | undefined> {
  return delay(store.borrowers.find((b) => b.id === id), 300);
}

export function isTaxIdDuplicate(taxId: string): boolean {
  return store.borrowers.some((b) => b.taxId === taxId);
}

export function createBorrower(actor: User, input: NewBorrowerInput): Promise<Borrower> {
  if (isTaxIdDuplicate(input.taxId)) {
    return Promise.reject(new Error('เลขนิติบุคคลนี้มีอยู่แล้วในระบบ'));
  }
  const now = new Date().toISOString();
  const borrower: Borrower = {
    id: nextBorrowerId(), ...input, status: 'ACTIVE', createdAt: now, updatedAt: now,
  };
  store.borrowers.push(borrower);
  logActivity(actor, 'BORROWER', 'BORROWER_CREATED', `เพิ่มผู้กู้ ${borrower.nameTh}`);
  return delay(borrower);
}

export function updateBorrower(
  actor: User, id: string, patch: Partial<NewBorrowerInput>,
): Promise<Borrower> {
  const b = store.borrowers.find((x) => x.id === id);
  if (!b) return Promise.reject(new Error('ไม่พบผู้กู้'));
  const before = JSON.stringify(b);
  Object.assign(b, patch, { updatedAt: new Date().toISOString() });
  logActivity(actor, 'BORROWER', 'BORROWER_UPDATED', `แก้ไขผู้กู้ ${b.nameTh}`,
    before, JSON.stringify(b));
  return delay(b);
}

export function deactivateBorrower(actor: User, id: string): Promise<Borrower> {
  const b = store.borrowers.find((x) => x.id === id);
  if (!b) return Promise.reject(new Error('ไม่พบผู้กู้'));
  b.status = 'INACTIVE';
  b.updatedAt = new Date().toISOString();
  logActivity(actor, 'BORROWER', 'BORROWER_DEACTIVATED', `ปิดใช้งานผู้กู้ ${b.nameTh}`);
  return delay(b);
}
