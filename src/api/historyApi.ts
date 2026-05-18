// src/api/historyApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User, Declaration, SearchHistoryRecord } from '../types';

export interface HistoryFilter {
  dateFrom?: string;
  dateTo?: string;
  searchedBy?: string;       // matches username or full name (contains)
  declarationNo?: string;
  referenceNumber?: string;
}

export function recordSearch(
  actor: User, decl: Declaration, referenceNumber: string,
): Promise<SearchHistoryRecord> {
  const rec: SearchHistoryRecord = {
    id: crypto.randomUUID(),
    declarationNo: decl.declarationNo,
    referenceNumber,
    searchedByUserId: actor.id,
    searchedByUsername: actor.username,
    searchedByFullName: `${actor.firstName} ${actor.lastName}`,
    searchedByRole: actor.role,
    declarationStatus: decl.status,
    fobValue: decl.fobValue,
    currency: decl.currency,
    searchedAt: new Date().toISOString(),
  };
  store.searchHistory.unshift(rec);
  logActivity(actor, 'VERIFICATION', 'DECLARATION_SEARCHED',
    `ค้นหาใบขน ${decl.declarationNo} / Ref: ${referenceNumber}`);
  return delay(rec);
}

export function hasHistory(declarationNo: string): Promise<boolean> {
  return delay(store.searchHistory.some((r) => r.declarationNo === declarationNo), 100);
}

export function listHistory(filter: HistoryFilter = {}): Promise<SearchHistoryRecord[]> {
  let rows = [...store.searchHistory];
  if (filter.dateFrom)
    rows = rows.filter((r) => r.searchedAt >= filter.dateFrom!);
  if (filter.dateTo)
    rows = rows.filter((r) => r.searchedAt <= filter.dateTo! + 'T23:59:59.999Z');
  if (filter.searchedBy) {
    const q = filter.searchedBy.toLowerCase();
    rows = rows.filter((r) =>
      r.searchedByUsername.toLowerCase().includes(q) ||
      r.searchedByFullName.toLowerCase().includes(q));
  }
  if (filter.declarationNo)
    rows = rows.filter((r) => r.declarationNo.includes(filter.declarationNo!));
  if (filter.referenceNumber)
    rows = rows.filter((r) => r.referenceNumber.includes(filter.referenceNumber!));
  rows.sort((a, b) => b.searchedAt.localeCompare(a.searchedAt));
  return delay(rows);
}
