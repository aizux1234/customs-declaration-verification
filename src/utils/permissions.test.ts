import { describe, it, expect } from 'vitest';
import { canAccess, accessibleModules, landingRoute } from './permissions';

describe('permissions', () => {
  it('only Super Admin and Admin reach user management', () => {
    expect(canAccess('SUPER_ADMIN', 'users')).toBe(true);
    expect(canAccess('ADMIN', 'users')).toBe(true);
    expect(canAccess('CREDIT_OFFICER', 'users')).toBe(false);
  });
  it('Credit Officer can verify but not manage borrowers', () => {
    expect(canAccess('CREDIT_OFFICER', 'verify')).toBe(true);
    expect(canAccess('CREDIT_OFFICER', 'borrowers')).toBe(false);
  });
  it('only Super Admin and Auditor reach activity log', () => {
    expect(canAccess('AUDITOR', 'activityLog')).toBe(true);
    expect(canAccess('ADMIN', 'activityLog')).toBe(false);
  });
  it('accessibleModules excludes denied modules', () => {
    expect(accessibleModules('ADMIN')).toContain('users');
    expect(accessibleModules('ADMIN')).not.toContain('verify');
  });
  it('landingRoute picks the first accessible route', () => {
    expect(landingRoute('CREDIT_OFFICER')).toBe('/verify');
    expect(landingRoute('ADMIN')).toBe('/users');
    expect(landingRoute('BORROWER_DATA_ENTRY')).toBe('/borrowers');
  });
});
