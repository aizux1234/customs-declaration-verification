type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions: number[];
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
};

export function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const navButton =
    'rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm text-navy-700 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm text-navy-600">
      <span>{`${start}-${end} of ${total}`}</span>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="page size"
          className="rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={navButton}
        >
          ก่อนหน้า
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          className={navButton}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
