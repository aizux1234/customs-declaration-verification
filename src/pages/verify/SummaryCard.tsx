// src/pages/verify/SummaryCard.tsx
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { Declaration, DeclarationStatus } from '../../types';

type SummaryCardProps = {
  declaration: Declaration;
  referenceNumber: string;
  onPreview: () => void;
};

const statusMeta: Record<
  DeclarationStatus,
  { label: string; tone: 'green' | 'red' | 'amber' }
> = {
  RELEASED: { label: 'ตรวจปล่อยแล้ว (RELEASED)', tone: 'green' },
  HOLD: { label: 'ระงับ (HOLD)', tone: 'red' },
  IN_PROCESS: { label: 'อยู่ระหว่างดำเนินการ (IN_PROCESS)', tone: 'amber' },
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{children}</span>
    </div>
  );
}

export function SummaryCard({
  declaration,
  referenceNumber,
  onPreview,
}: SummaryCardProps) {
  const status = statusMeta[declaration.status];

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">เลขที่ใบขน</span>
          <span className="text-lg font-semibold text-navy">
            {declaration.declarationNo}
          </span>
        </div>
        <Badge text={status.label} tone={status.tone} />
      </div>

      {declaration.status === 'HOLD' && (
        <Alert tone="warning" variant="banner">
          ใบขนนี้ถูกระงับ (HOLD) โดยกรมศุลกากร กรุณาตรวจสอบรายละเอียดก่อนพิจารณาสินเชื่อ
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="วันที่ใบขน">{formatDate(declaration.declarationDate)}</Field>
        <Field label="วันที่ส่งออก">{formatDate(declaration.exportDate)}</Field>
        <Field label="Reference Number">{referenceNumber}</Field>
        <Field label="มูลค่า FOB">
          {formatCurrency(declaration.fobValue)} {declaration.currency}
        </Field>
        <Field label="มูลค่า CIF">
          {formatCurrency(declaration.cifValue)} {declaration.currency}
        </Field>
        <Field label="ผู้ส่งออก">{declaration.exporterName}</Field>
        <Field label="ประเทศปลายทาง">{declaration.destinationCountry}</Field>
      </div>

      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <Button variant="primary" onClick={onPreview}>
          Preview เอกสาร
        </Button>
        <Link
          to="/reports/search-history"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-gray-50"
        >
          ดูประวัติค้นหา
        </Link>
      </div>
    </div>
  );
}
