import type { Role } from '../types';

export type ModuleKey =
  | 'users' | 'verify' | 'history'
  | 'borrowers' | 'declarations' | 'activityLog';

const MATRIX: Record<ModuleKey, Role[]> = {
  users:       ['SUPER_ADMIN', 'ADMIN'],
  verify:      ['SUPER_ADMIN', 'CREDIT_OFFICER', 'AUDITOR'],
  history:     ['SUPER_ADMIN', 'CREDIT_OFFICER', 'AUDITOR'],
  borrowers:   ['SUPER_ADMIN', 'BORROWER_DATA_ENTRY', 'AUDITOR'],
  declarations:['SUPER_ADMIN', 'CUSTOMS_DATA_ENTRY', 'AUDITOR'],
  activityLog: ['SUPER_ADMIN', 'AUDITOR'],
};

const ROUTE_ORDER: { module: ModuleKey; path: string }[] = [
  { module: 'verify', path: '/verify' },
  { module: 'users', path: '/users' },
  { module: 'borrowers', path: '/borrowers' },
  { module: 'declarations', path: '/declarations' },
  { module: 'history', path: '/reports/search-history' },
  { module: 'activityLog', path: '/activity-log' },
];

export function canAccess(role: Role, module: ModuleKey): boolean {
  return MATRIX[module].includes(role);
}

export function accessibleModules(role: Role): ModuleKey[] {
  return (Object.keys(MATRIX) as ModuleKey[]).filter((m) => canAccess(role, m));
}

export function landingRoute(role: Role): string {
  const hit = ROUTE_ORDER.find((r) => canAccess(role, r.module));
  return hit ? hit.path : '/verify';
}
