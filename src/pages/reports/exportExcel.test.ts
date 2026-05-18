// src/pages/reports/exportExcel.test.ts
import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { buildHistoryWorkbook } from './exportExcel';
import type { SearchHistoryRecord } from '../../types';

const row: SearchHistoryRecord = {
  id: '1', declarationNo: 'A012-650518000001', referenceNumber: 'REF001',
  searchedByUserId: 'U-001', searchedByUsername: 'officer01',
  searchedByFullName: 'สมชาย ใจดี', searchedByRole: 'CREDIT_OFFICER',
  declarationStatus: 'RELEASED', fobValue: 1000, currency: 'USD',
  searchedAt: '2026-05-18T03:00:00.000Z',
};

describe('buildHistoryWorkbook', () => {
  it('produces a sheet with a header and one data row', () => {
    const wb = buildHistoryWorkbook([row]);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(json.length).toBe(2);
    expect((json[1] as string[]).includes('A012-650518000001')).toBe(true);
  });
});
