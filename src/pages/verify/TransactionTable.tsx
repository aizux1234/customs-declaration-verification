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
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-navy">รายการสินค้า</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2 font-medium">ชื่อสินค้า</th>
              <th className="px-3 py-2 font-medium">HS Code</th>
              <th className="px-3 py-2 font-medium">จำนวน</th>
              <th className="px-3 py-2 font-medium text-right">น้ำหนัก</th>
              <th className="px-3 py-2 font-medium text-right">ราคาต่อหน่วย</th>
              <th className="px-3 py-2 font-medium text-right">มูลค่ารวม</th>
              <th className="px-3 py-2 font-medium">ประเทศกำเนิดสินค้า</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr
                key={`${item.hsCode}-${idx}`}
                className="border-b border-gray-100 text-gray-800"
              >
                <td className="px-3 py-2 font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-3 py-2">{item.hsCode}</td>
                <td className="px-3 py-2">
                  {item.quantity.toLocaleString('en-US')} {item.unit}
                </td>
                <td className="px-3 py-2 text-right">
                  {item.weight.toLocaleString('en-US')} kg
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(item.totalValue)}
                </td>
                <td className="px-3 py-2">{item.originCountry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        แสดง {lineItems.length} รายการ
      </p>

      <div className="grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">เลขที่ตู้คอนเทนเนอร์</span>
          <span className="text-sm font-medium text-gray-900">
            {declaration.containerNo ?? '-'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">ชื่อเรือ/เที่ยวบิน</span>
          <span className="text-sm font-medium text-gray-900">
            {declaration.vesselName ?? '-'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">ผู้กู้ที่เชื่อมโยง</span>
          <span className="text-sm font-medium text-gray-900">
            {borrowerName}
          </span>
        </div>
      </div>
    </div>
  );
}
