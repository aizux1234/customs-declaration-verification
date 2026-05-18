// src/pages/verify/DocumentPreview.tsx
import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { logActivity } from '../../data/activityLog';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { Declaration, DeclarationStatus, User } from '../../types';

type DocumentPreviewProps = {
  open: boolean;
  declaration: Declaration;
  actor: User;
  onClose: () => void;
};

const statusLabel: Record<DeclarationStatus, string> = {
  RELEASED: 'ตรวจปล่อยแล้ว (RELEASED)',
  HOLD: 'ระงับ (HOLD)',
  IN_PROCESS: 'อยู่ระหว่างดำเนินการ (IN_PROCESS)',
};

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.2;

export function DocumentPreview({
  open,
  declaration,
  actor,
  onClose,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (open) {
      setZoom(1);
      logActivity(
        actor,
        'VERIFICATION',
        'DECLARATION_PREVIEWED',
        `เปิดดูเอกสารใบขนเลขที่ ${declaration.declarationNo}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
        disabled={zoom <= ZOOM_MIN}
      >
        Zoom Out
      </Button>
      <Button
        variant="secondary"
        onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
        disabled={zoom >= ZOOM_MAX}
      >
        Zoom In
      </Button>
      <Button variant="secondary" onClick={() => window.print()}>
        พิมพ์เอกสาร
      </Button>
      <Button variant="primary" onClick={onClose}>
        ปิด
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      title="ตัวอย่างเอกสารใบขนสินค้า"
      onClose={onClose}
      footer={footer}
    >
      <div className="flex justify-center bg-navy-100 p-6">
        <div
          className="document-preview w-[680px] origin-top border border-navy-300 bg-white text-sm text-navy-900 shadow-pop"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Header band */}
          <div className="flex items-start justify-between gap-6 border-b-4 border-double border-navy-800 bg-navy-50 px-8 py-5">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-navy-800">
                ใบขนสินค้าขาออก
              </h3>
              <p className="text-xs text-navy-500">
                Export Declaration · กรมศุลกากร (จำลองเพื่อการตรวจสอบ)
              </p>
            </div>
            <div className="rounded border border-navy-300 bg-white px-3 py-2 text-right text-xs">
              <p className="text-navy-500">เลขที่ใบขน</p>
              <p className="font-mono text-sm font-semibold text-navy-800">
                {declaration.declarationNo}
              </p>
            </div>
          </div>

          <div className="px-8 py-6">
            {/* Top info row */}
            <div className="mb-5 grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-navy-500">
                  วันที่ใบขน
                </span>
                <span className="font-medium">
                  {formatDate(declaration.declarationDate)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-navy-500">
                  วันที่ส่งออก
                </span>
                <span className="font-medium">
                  {formatDate(declaration.exportDate)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-navy-500">
                  สถานะ
                </span>
                <span className="font-semibold text-navy-800">
                  {statusLabel[declaration.status]}
                </span>
              </div>
            </div>

            {/* Exporter / destination section */}
            <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded border border-navy-200 bg-navy-200">
              <div className="flex flex-col gap-0.5 bg-white px-4 py-3">
                <span className="text-[11px] uppercase tracking-wide text-navy-500">
                  ผู้ส่งออก
                </span>
                <span className="font-medium">{declaration.exporterName}</span>
              </div>
              <div className="flex flex-col gap-0.5 bg-white px-4 py-3">
                <span className="text-[11px] uppercase tracking-wide text-navy-500">
                  ประเทศปลายทาง
                </span>
                <span className="font-medium">
                  {declaration.destinationCountry}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 bg-white px-4 py-3">
                <span className="text-[11px] uppercase tracking-wide text-navy-500">
                  เลขที่ตู้คอนเทนเนอร์
                </span>
                <span className="font-medium">
                  {declaration.containerNo ?? '-'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 bg-white px-4 py-3">
                <span className="text-[11px] uppercase tracking-wide text-navy-500">
                  ชื่อเรือ/เที่ยวบิน
                </span>
                <span className="font-medium">
                  {declaration.vesselName ?? '-'}
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="mb-5">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-600">
                รายการสินค้า
              </h4>
              <table className="w-full border-collapse border border-navy-200 text-xs">
                <thead>
                  <tr className="bg-navy-50 text-left text-navy-600">
                    <th className="border border-navy-200 px-2 py-1.5 font-semibold">
                      ชื่อสินค้า
                    </th>
                    <th className="border border-navy-200 px-2 py-1.5 font-semibold">
                      HS Code
                    </th>
                    <th className="border border-navy-200 px-2 py-1.5 font-semibold">
                      จำนวน
                    </th>
                    <th className="border border-navy-200 px-2 py-1.5 text-right font-semibold">
                      น้ำหนัก
                    </th>
                    <th className="border border-navy-200 px-2 py-1.5 text-right font-semibold">
                      ราคาต่อหน่วย
                    </th>
                    <th className="border border-navy-200 px-2 py-1.5 text-right font-semibold">
                      มูลค่ารวม
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {declaration.lineItems.map((item, idx) => (
                    <tr key={`${item.hsCode}-${idx}`}>
                      <td className="border border-navy-200 px-2 py-1.5">
                        {item.productName}
                      </td>
                      <td className="border border-navy-200 px-2 py-1.5 font-mono">
                        {item.hsCode}
                      </td>
                      <td className="border border-navy-200 px-2 py-1.5">
                        {item.quantity.toLocaleString('en-US')} {item.unit}
                      </td>
                      <td className="border border-navy-200 px-2 py-1.5 text-right">
                        {item.weight.toLocaleString('en-US')} kg
                      </td>
                      <td className="border border-navy-200 px-2 py-1.5 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="border border-navy-200 px-2 py-1.5 text-right">
                        {formatCurrency(item.totalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 rounded border border-navy-300 bg-navy-50">
                <div className="flex justify-between border-b border-navy-200 px-4 py-2">
                  <span className="text-navy-500">มูลค่า FOB</span>
                  <span className="font-medium text-navy-800">
                    {formatCurrency(declaration.fobValue)}{' '}
                    {declaration.currency}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-navy-500">มูลค่า CIF</span>
                  <span className="font-semibold text-navy-800">
                    {formatCurrency(declaration.cifValue)}{' '}
                    {declaration.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
