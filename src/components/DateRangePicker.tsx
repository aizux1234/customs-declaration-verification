type DateRangePickerProps = {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
};

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const inputClass =
    'rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400';
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="date"
        value={from}
        aria-label="from date"
        onChange={(e) => onChange(e.target.value, to)}
        className={inputClass}
      />
      <span className="text-navy-500">ถึง</span>
      <input
        type="date"
        value={to}
        aria-label="to date"
        onChange={(e) => onChange(from, e.target.value)}
        className={inputClass}
      />
    </div>
  );
}
