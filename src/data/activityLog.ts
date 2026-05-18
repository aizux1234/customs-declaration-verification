// src/data/activityLog.ts
import { store } from './store';
import type { User, LogModule } from '../types';

export function logActivity(
  actor: User,
  module: LogModule,
  actionType: string,
  detail: string,
  beforeValue: string | null = null,
  afterValue: string | null = null,
): void {
  store.activityLog.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: actor.id,
    username: actor.username,
    fullName: `${actor.firstName} ${actor.lastName}`,
    role: actor.role,
    actionType,
    module,
    detail,
    beforeValue,
    afterValue,
    ipAddress: '192.168.1.10',
  });
}
