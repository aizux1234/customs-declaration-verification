// src/api/declarationApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User, DeclarationLink } from '../types';

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
