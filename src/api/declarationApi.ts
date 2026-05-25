// src/api/declarationApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type {
  User,
  Declaration,
  DeclarationLink,
  DeclarationStatus,
} from '../types';

export interface DeclarationFilter {
  query?: string;
  status?: DeclarationStatus;
  borrowerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DeclarationInput {
  declarationNo: string;
  declarationDate: string;
  status: DeclarationStatus;
  fobValue: number;
  cifValue: number;
  currency: string;
  exporterName: string;
  destinationCountry: string;
  exportDate: string;
  containerNo: string | null;
  vesselName: string | null;
}

export interface DeclarationRow {
  declaration: Declaration;
  borrowerId: string | null;
  borrowerName: string | null;
  linkId: string | null;
}

function findLinkFor(declarationNo: string): DeclarationLink | undefined {
  return store.declarationLinks.find((l) => l.declarationNo === declarationNo);
}

export function listDeclarations(
  filter: DeclarationFilter = {},
): Promise<DeclarationRow[]> {
  const rows: DeclarationRow[] = store.declarations.map((d) => {
    const link = findLinkFor(d.declarationNo);
    const borrower = link
      ? store.borrowers.find((b) => b.id === link.borrowerId) ?? null
      : null;
    return {
      declaration: d,
      borrowerId: link?.borrowerId ?? null,
      borrowerName: borrower?.nameTh ?? null,
      linkId: link?.id ?? null,
    };
  });

  let filtered = rows;
  if (filter.query) {
    const q = filter.query.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.declaration.declarationNo.toLowerCase().includes(q) ||
        r.declaration.exporterName.toLowerCase().includes(q),
    );
  }
  if (filter.status) {
    filtered = filtered.filter((r) => r.declaration.status === filter.status);
  }
  if (filter.borrowerId) {
    filtered = filtered.filter((r) => r.borrowerId === filter.borrowerId);
  }
  if (filter.dateFrom) {
    const from = new Date(filter.dateFrom).getTime();
    filtered = filtered.filter(
      (r) => new Date(r.declaration.declarationDate).getTime() >= from,
    );
  }
  if (filter.dateTo) {
    const to = new Date(filter.dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
    filtered = filtered.filter(
      (r) => new Date(r.declaration.declarationDate).getTime() <= to,
    );
  }

  filtered.sort((a, b) =>
    b.declaration.declarationDate.localeCompare(a.declaration.declarationDate),
  );
  return delay(filtered);
}

export function getDeclaration(
  declarationNo: string,
): Promise<Declaration | undefined> {
  return delay(
    store.declarations.find((d) => d.declarationNo === declarationNo),
    300,
  );
}

export function isDeclarationNoDuplicate(declarationNo: string): boolean {
  return store.declarations.some((d) => d.declarationNo === declarationNo);
}

export function createDeclaration(
  actor: User,
  input: DeclarationInput,
): Promise<Declaration> {
  if (isDeclarationNoDuplicate(input.declarationNo)) {
    return Promise.reject(new Error('เลขที่ใบขนนี้มีอยู่แล้วในระบบ'));
  }
  const declaration: Declaration = { ...input, lineItems: [] };
  store.declarations.push(declaration);
  logActivity(
    actor,
    'DECLARATION',
    'DECLARATION_CREATED',
    `เพิ่มใบขน ${declaration.declarationNo}`,
  );
  return delay(declaration);
}

export function updateDeclaration(
  actor: User,
  declarationNo: string,
  patch: DeclarationInput,
): Promise<Declaration> {
  const d = store.declarations.find((x) => x.declarationNo === declarationNo);
  if (!d) return Promise.reject(new Error('ไม่พบใบขน'));
  if (
    patch.declarationNo !== declarationNo &&
    isDeclarationNoDuplicate(patch.declarationNo)
  ) {
    return Promise.reject(new Error('เลขที่ใบขนนี้มีอยู่แล้วในระบบ'));
  }
  const before = JSON.stringify(d);
  Object.assign(d, patch);
  logActivity(
    actor,
    'DECLARATION',
    'DECLARATION_UPDATED',
    `แก้ไขใบขน ${d.declarationNo}`,
    before,
    JSON.stringify(d),
  );
  return delay(d);
}

export function listLinksByBorrower(borrowerId: string): Promise<DeclarationLink[]> {
  const rows = store.declarationLinks
    .filter((l) => l.borrowerId === borrowerId)
    .sort((a, b) => b.linkedAt.localeCompare(a.linkedAt));
  return delay(rows);
}

export function linkDeclaration(
  actor: User, borrowerId: string, declarationNo: string, documentFileName: string,
): Promise<DeclarationLink> {
  const dup = store.declarationLinks.some(
    (l) => l.borrowerId === borrowerId && l.declarationNo === declarationNo);
  if (dup) return Promise.reject(new Error('ใบขนนี้ถูกเชื่อมโยงกับผู้กู้รายนี้แล้ว'));

  const link: DeclarationLink = {
    id: crypto.randomUUID(),
    borrowerId, declarationNo, documentFileName,
    linkedAt: new Date().toISOString(),
    linkedByUsername: actor.username,
  };
  store.declarationLinks.push(link);
  logActivity(actor, 'DECLARATION', 'DECLARATION_LINKED',
    `เชื่อมโยงใบขน ${declarationNo} กับผู้กู้ ${borrowerId}`);
  return delay(link);
}

export function unlinkDeclaration(actor: User, linkId: string): Promise<void> {
  const idx = store.declarationLinks.findIndex((l) => l.id === linkId);
  if (idx === -1) return Promise.reject(new Error('ไม่พบการเชื่อมโยง'));
  const [removed] = store.declarationLinks.splice(idx, 1);
  logActivity(actor, 'DECLARATION', 'DECLARATION_UNLINKED',
    `ยกเลิกการเชื่อมโยงใบขน ${removed.declarationNo}`);
  return delay(undefined);
}
