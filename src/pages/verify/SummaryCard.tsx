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
    <div className="flex flex-col gap-1">
      <span className="text-xs text-navy-500">{label}</span>
      <span className="text-sm text-navy-800">{children}</span>
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
    <div className="overflow-hidden rounded-lg bg-white shadow-card">
      <div className="flex items-center justify-between gap-4 border-b border-navy-100 bg-navy-50 px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-navy-500">เลขที่ใบขน</span>
          <span className="font-mono text-lg font-semibold text-navy-800">
            {declaration.declarationNo}
          </span>
        </div>
        <Badge text={status.label} tone={status.tone} />
      </div>

      <div className="flex flex-col gap-5 p-6">
        {declaration.status === 'HOLD' && (
          <Alert tone="warning" variant="banner">
            ใบขนนี้ถูกระงับ (HOLD) โดยกรมศุลกากร กรุณาตรวจสอบรายละเอียดก่อนพิจารณาสินเชื่อ
          </Alert>
        )}

        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="วันที่ใบขน">{formatDate(declaration.declarationDate)}</Field>
          <Field label="วันที่ส่งออก">{formatDate(declaration.exportDate)}</Field>
          <Field label="Reference Number">{referenceNumber}</Field>
          <Field label="มูลค่า FOB">
            <span className="font-medium text-navy-900">
              {formatCurrency(declaration.fobValue)}
            </span>{' '}
            <span className="text-navy-500">{declaration.currency}</span>
          </Field>
          <Field label="มูลค่า CIF">
            <span className="font-medium text-navy-900">
              {formatCurrency(declaration.cifValue)}
            </span>{' '}
            <span className="text-navy-500">{declaration.currency}</span>
          </Field>
          <Field label="ผู้ส่งออก">{declaration.exporterName}</Field>
          <Field label="ประเทศปลายทาง">{declaration.destinationCountry}</Field>
        </dl>

        <div className="flex gap-3 border-t border-navy-100 pt-4">
          <Button variant="primary" onClick={onPreview}>
            Preview เอกสาร
          </Button>
          <Link
            to="/reports/search-history"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-navy-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50"
          >
            ดูประวัติค้นหา
          </Link>
        </div>
      </div>
    </div>
  );
}
