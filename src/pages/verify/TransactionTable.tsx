// src/pages/verify/TransactionTable.tsx
import { store } from '../../data/store';
import { formatCurrency } from '../../utils/formatters';
import type { Declaration } from '../../types';

type TransactionTableProps = {
  declaration: Declaration;
};

function resolveBorrowerName(declarationNo: string): string {
  const link = store.declarationLinks.find(
    (l) => l.declarationNo === declarationNo,
  );
  if (!link) return 'ไม่มี';
  const borrower = store.borrowers.find((b) => b.id === link.borrowerId);
  return borrower ? borrower.nameTh : 'ไม่มี';
}

export function TransactionTable({ declaration }: TransactionTableProps) {
  const { lineItems } = declaration;
  const borrowerName = resolveBorrowerName(declaration.declarationNo);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card">
      <div className="border-b border-navy-100 px-6 py-4">
        <h2 className="text-base font-semibold text-navy-800">รายการสินค้า</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-navy-50 text-left text-xs font-semibold uppercase text-navy-600">
              <th className="px-4 py-3">ชื่อสินค้า</th>
              <th className="px-4 py-3">HS Code</th>
              <th className="px-4 py-3">จำนวน</th>
              <th className="px-4 py-3 text-right">น้ำหนัก</th>
              <th className="px-4 py-3 text-right">ราคาต่อหน่วย</th>
              <th className="px-4 py-3 text-right">มูลค่ารวม</th>
              <th className="px-4 py-3">ประเทศกำเนิดสินค้า</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr
                key={`${item.hsCode}-${idx}`}
                className="border-t border-navy-100 text-navy-700"
              >
                <td className="px-4 py-3 font-medium text-navy-900">
                  {item.productName}
                </td>
                <td className="px-4 py-3 font-mono text-navy-600">
                  {item.hsCode}
                </td>
                <td className="px-4 py-3">
                  {item.quantity.toLocaleString('en-US')} {item.unit}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.weight.toLocaleString('en-US')} kg
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-navy-900">
                  {formatCurrency(item.totalValue)}
                </td>
                <td className="px-4 py-3">{item.originCountry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 border-t border-navy-100 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-navy-500">จำนวนรายการ</span>
          <span className="text-sm text-navy-800">
            แสดง {lineItems.length} รายการ
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-navy-500">เลขที่ตู้คอนเทนเนอร์</span>
          <span className="text-sm text-navy-800">
            {declaration.containerNo ?? '-'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-navy-500">ชื่อเรือ/เที่ยวบิน</span>
          <span className="text-sm text-navy-800">
            {declaration.vesselName ?? '-'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-navy-500">ผู้กู้ที่เชื่อมโยง</span>
          <span className="text-sm text-navy-800">{borrowerName}</span>
        </div>
      </div>
    </div>
  );
}
