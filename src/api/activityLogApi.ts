// src/api/activityLogApi.ts
import { store } from '../data/store';
import { delay } from './_helpers';
import type { ActivityLogEntry, LogModule } from '../types';

export interface ActivityLogFilter {
  dateFrom?: string;
  dateTo?: string;
  username?: string;
  actionTypes?: string[];
  module?: LogModule;
}

export function listActivityLog(
  filter: ActivityLogFilter = {},
): Promise<ActivityLogEntry[]> {
  let rows = [...store.activityLog];
  if (filter.dateFrom) rows = rows.filter((r) => r.timestamp >= filter.dateFrom!);
  if (filter.dateTo)
    rows = rows.filter((r) => r.timestamp <= filter.dateTo! + 'T23:59:59.999Z');
  if (filter.username) {
    const q = filter.username.toLowerCase();
    rows = rows.filter((r) => r.username.toLowerCase().includes(q));
  }
  if (filter.actionTypes && filter.actionTypes.length)
    rows = rows.filter((r) => filter.actionTypes!.includes(r.actionType));
  if (filter.module) rows = rows.filter((r) => r.module === filter.module);
  rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return delay(rows);
}
