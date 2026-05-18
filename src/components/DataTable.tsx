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
        <tr className="bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-600">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 ${col.className ?? ''}`}
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
            className={`border-t border-navy-100 transition-colors hover:bg-navy-50/60 ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
          >
            {columns.map((col) => (
              <td key={col.key} className={`px-4 py-3 text-navy-700 ${col.className ?? ''}`}>
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
