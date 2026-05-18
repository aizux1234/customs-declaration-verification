// src/utils/validators.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateUsername, validatePassword, validateReferenceNumber,
  validateTaxId, validatePhone, validateCreditLimit, validateEmail,
  validateDateRange,
} from './validators';

describe('validators', () => {
  it('username: 6-50 chars, no spaces', () => {
    expect(validateUsername('user01')).toBeNull();
    expect(validateUsername('abc')).toMatch(/6-50/);
    expect(validateUsername('has space')).toMatch(/6-50/);
  });

  it('password: 8+ chars with upper, lower, digit, special', () => {
    expect(validatePassword('Passw0rd!')).toBeNull();
    expect(validatePassword('weak')).not.toBeNull();
    expect(validatePassword('alllowercase1!')).not.toBeNull();
  });

  it('reference number: ^[A-Za-z0-9]{1,20}$', () => {
    expect(validateReferenceNumber('ABC123')).toBeNull();
    expect(validateReferenceNumber('')).not.toBeNull();
    expect(validateReferenceNumber('has-dash')).not.toBeNull();
    expect(validateReferenceNumber('A'.repeat(21))).not.toBeNull();
  });

  it('taxId: exactly 13 digits', () => {
    expect(validateTaxId('1234567890123')).toBeNull();
    expect(validateTaxId('123')).not.toBeNull();
  });

  it('phone: 9-10 digits', () => {
    expect(validatePhone('0812345678')).toBeNull();
    expect(validatePhone('123')).not.toBeNull();
  });

  it('creditLimit: number > 0', () => {
    expect(validateCreditLimit(100)).toBeNull();
    expect(validateCreditLimit(0)).not.toBeNull();
  });

  it('email: basic format', () => {
    expect(validateEmail('a@b.com')).toBeNull();
    expect(validateEmail('bad')).not.toBeNull();
  });

  it('dateRange: start <= end', () => {
    expect(validateDateRange('2026-01-01', '2026-01-02')).toBeNull();
    expect(validateDateRange('2026-01-03', '2026-01-01')).not.toBeNull();
  });
});
