// src/api/userApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User, Role, EntityStatus } from '../types';

export interface UserFilter { query?: string; role?: Role; status?: EntityStatus; }
export interface NewUserInput {
  username: string; firstName: string; lastName: string; email: string;
  phone: string; position: string; role: Role; password: string;
}

let userSeq = 100;
function nextUserId(): string { userSeq += 1; return `U-${userSeq}`; }

export function listUsers(filter: UserFilter = {}): Promise<User[]> {
  let rows = [...store.users];
  if (filter.query) {
    const q = filter.query.toLowerCase();
    rows = rows.filter((u) =>
      u.username.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q));
  }
  if (filter.role) rows = rows.filter((u) => u.role === filter.role);
  if (filter.status) rows = rows.filter((u) => u.status === filter.status);
  return delay(rows);
}

export function createUser(actor: User, input: NewUserInput): Promise<User> {
  if (store.users.some((u) => u.username === input.username)) {
    return Promise.reject(new Error('Username นี้มีอยู่แล้วในระบบ'));
  }
  const now = new Date().toISOString();
  const user: User = {
    id: nextUserId(), ...input, status: 'ACTIVE',
    failedLoginCount: 0, lockedUntil: null, lastLoginAt: null,
    createdAt: now, updatedAt: now,
  };
  store.users.push(user);
  logActivity(actor, 'USER_MGMT', 'USER_CREATED', `สร้างผู้ใช้ ${user.username}`);
  return delay(user);
}

export function updateUser(
  actor: User, id: string, patch: Partial<NewUserInput & { status: EntityStatus }>,
): Promise<User> {
  const user = store.users.find((u) => u.id === id);
  if (!user) return Promise.reject(new Error('ไม่พบผู้ใช้'));
  const before = { ...user };
  Object.assign(user, patch, { updatedAt: new Date().toISOString() });
  if (patch.role && patch.role !== before.role) {
    logActivity(actor, 'USER_MGMT', 'ROLE_CHANGED',
      `เปลี่ยน Role ของ ${user.username}`, before.role, patch.role);
  } else {
    logActivity(actor, 'USER_MGMT', 'USER_UPDATED', `แก้ไขผู้ใช้ ${user.username}`);
  }
  return delay(user);
}

export function deactivateUser(actor: User, id: string): Promise<User> {
  if (actor.id === id) {
    return Promise.reject(new Error('ไม่สามารถปิดใช้งานบัญชีของตนเองได้'));
  }
  const user = store.users.find((u) => u.id === id);
  if (!user) return Promise.reject(new Error('ไม่พบผู้ใช้'));
  user.status = 'INACTIVE';
  user.updatedAt = new Date().toISOString();
  logActivity(actor, 'USER_MGMT', 'USER_DEACTIVATED', `ปิดใช้งานผู้ใช้ ${user.username}`);
  return delay(user);
}
