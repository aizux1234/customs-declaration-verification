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
      <div className="flex justify-center bg-gray-100 p-4">
        <div
          className="document-preview w-[640px] origin-top bg-white p-8 text-sm text-gray-900 shadow"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-navy pb-4">
            <div>
              <h3 className="text-lg font-bold text-navy">
                ใบขนสินค้าขาออก
              </h3>
              <p className="text-xs text-gray-500">
                กรมศุลกากร (จำลองเพื่อการตรวจสอบ)
              </p>
            </div>
            <div className="text-right text-xs">
              <p>
                <span className="text-gray-500">เลขที่ใบขน: </span>
                <span className="font-semibold">
                  {declaration.declarationNo}
                </span>
              </p>
              <p>
                <span className="text-gray-500">วันที่: </span>
                {formatDate(declaration.declarationDate)}
              </p>
              <p>
                <span className="text-gray-500">สถานะ: </span>
                <span className="font-semibold">
                  {statusLabel[declaration.status]}
                </span>
              </p>
            </div>
          </div>

          {/* Exporter / destination */}
          <div className="grid grid-cols-2 gap-4 border-b border-gray-200 py-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500">ผู้ส่งออก</span>
              <span className="font-medium">{declaration.exporterName}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500">ประเทศปลายทาง</span>
              <span className="font-medium">
                {declaration.destinationCountry}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500">วันที่ส่งออก</span>
              <span className="font-medium">
                {formatDate(declaration.exportDate)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500">เลขที่ตู้คอนเทนเนอร์</span>
              <span className="font-medium">
                {declaration.containerNo ?? '-'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500">ชื่อเรือ/เที่ยวบิน</span>
              <span className="font-medium">
                {declaration.vesselName ?? '-'}
              </span>
            </div>
          </div>

          {/* Line items */}
          <div className="py-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              รายการสินค้า
            </h4>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-500">
                  <th className="py-1 pr-2 font-medium">ชื่อสินค้า</th>
                  <th className="py-1 pr-2 font-medium">HS Code</th>
                  <th className="py-1 pr-2 font-medium">จำนวน</th>
                  <th className="py-1 pr-2 font-medium text-right">น้ำหนัก</th>
                  <th className="py-1 pr-2 font-medium text-right">
                    ราคาต่อหน่วย
                  </th>
                  <th className="py-1 font-medium text-right">มูลค่ารวม</th>
                </tr>
              </thead>
              <tbody>
                {declaration.lineItems.map((item, idx) => (
                  <tr
                    key={`${item.hsCode}-${idx}`}
                    className="border-b border-gray-100"
                  >
                    <td className="py-1 pr-2">{item.productName}</td>
                    <td className="py-1 pr-2">{item.hsCode}</td>
                    <td className="py-1 pr-2">
                      {item.quantity.toLocaleString('en-US')} {item.unit}
                    </td>
                    <td className="py-1 pr-2 text-right">
                      {item.weight.toLocaleString('en-US')} kg
                    </td>
                    <td className="py-1 pr-2 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-1 text-right">
                      {formatCurrency(item.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end border-t-2 border-navy pt-4">
            <div className="flex w-64 flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-gray-500">มูลค่า FOB</span>
                <span className="font-medium">
                  {formatCurrency(declaration.fobValue)} {declaration.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">มูลค่า CIF</span>
                <span className="font-medium">
                  {formatCurrency(declaration.cifValue)} {declaration.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
