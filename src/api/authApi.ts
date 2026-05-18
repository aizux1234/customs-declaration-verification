// src/api/authApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User } from '../types';

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'INVALID' | 'LOCKED' | 'INACTIVE'; attemptsLeft: number };

const MAX_ATTEMPTS = 5;

export function login(username: string, password: string): Promise<LoginResult> {
  const user = store.users.find((u) => u.username === username);

  if (!user) return delay({ ok: false, reason: 'INVALID', attemptsLeft: MAX_ATTEMPTS });

  if (user.lockedUntil) {
    logActivity(user, 'AUTH', 'LOGIN_FAILED', `บัญชีถูกล็อก: ${username}`);
    return delay({ ok: false, reason: 'LOCKED', attemptsLeft: 0 });
  }
  if (user.status === 'INACTIVE') {
    return delay({ ok: false, reason: 'INACTIVE', attemptsLeft: MAX_ATTEMPTS });
  }
  if (user.password !== password) {
    user.failedLoginCount += 1;
    const left = MAX_ATTEMPTS - user.failedLoginCount;
    if (user.failedLoginCount >= MAX_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + 30 * 60_000).toISOString();
      logActivity(user, 'AUTH', 'ACCOUNT_LOCKED', `บัญชีถูกล็อก: ${username}`);
      return delay({ ok: false, reason: 'LOCKED', attemptsLeft: 0 });
    }
    logActivity(user, 'AUTH', 'LOGIN_FAILED', `เข้าสู่ระบบไม่สำเร็จ: ${username}`);
    return delay({ ok: false, reason: 'INVALID', attemptsLeft: left });
  }

  user.failedLoginCount = 0;
  user.lastLoginAt = new Date().toISOString();
  logActivity(user, 'AUTH', 'LOGIN_SUCCESS', `เข้าสู่ระบบสำเร็จ: ${username}`);
  return delay({ ok: true, user });
}

export function logout(user: User): Promise<void> {
  logActivity(user, 'AUTH', 'LOGOUT', `ออกจากระบบ: ${user.username}`);
  return delay(undefined);
}
