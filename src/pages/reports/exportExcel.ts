// src/pages/reports/exportExcel.ts
import * as XLSX from 'xlsx';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import type { SearchHistoryRecord } from '../../types';

const HEADER = [
  'วันเวลาที่ค้นหา',
  'ชื่อผู้ค้นหา',
  'Role',
  'เลขที่ใบขน',
  'Reference Number',
  'สถานะใบขน',
  'มูลค่า FOB',
] as const;

/** Build an xlsx workbook from history rows. PURE — no file I/O. */
export function buildHistoryWorkbook(
  rows: SearchHistoryRecord[],
): XLSX.WorkBook {
  const aoa: (string | number)[][] = [
    [...HEADER],
    ...rows.map((r) => [
      formatDateTime(r.searchedAt),
      `${r.searchedByFullName} (${r.searchedByUsername})`,
      r.searchedByRole,
      r.declarationNo,
      r.referenceNumber,
      r.declarationStatus,
      `${formatCurrency(r.fobValue)} ${r.currency}`,
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Search History');
  return wb;
}

/** Build the workbook and trigger a browser download. */
export function downloadHistoryExcel(rows: SearchHistoryRecord[]): void {
  const wb = buildHistoryWorkbook(rows);
  XLSX.writeFile(wb, 'search-history.xlsx');
}
