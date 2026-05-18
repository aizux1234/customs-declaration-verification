import type { ReactNode } from 'react';

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  if (rows.length === 0) return null;
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-navy text-left text-white">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-3 py-2 font-medium ${col.className ?? ''}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`border-b border-gray-200 hover:bg-gray-50 ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
          >
            {columns.map((col) => (
              <td key={col.key} className={`px-3 py-2 ${col.className ?? ''}`}>
                {col.render
                  ? col.render(row)
                  : ((row as Record<string, unknown>)[col.key] as ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
