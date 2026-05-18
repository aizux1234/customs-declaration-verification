// src/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatCurrency } from './formatters';

describe('formatters', () => {
  it('formatDate -> DD/MM/YYYY', () => {
    expect(formatDate('2026-05-18T10:30:00.000Z')).toBe('18/05/2026');
  });
  it('formatDateTime -> DD/MM/YYYY HH:mm:ss', () => {
    expect(formatDateTime('2026-05-18T03:05:09.000Z'))
      .toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
  });
  it('formatCurrency -> #,###.## with 2 decimals', () => {
    expect(formatCurrency(1234567.5)).toBe('1,234,567.50');
    expect(formatCurrency(0)).toBe('0.00');
  });
});
