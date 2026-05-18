type DateRangePickerProps = {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
};

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="date"
        value={from}
        aria-label="from date"
        onChange={(e) => onChange(e.target.value, to)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900"
      />
      <span className="text-gray-500">–</span>
      <input
        type="date"
        value={to}
        aria-label="to date"
        onChange={(e) => onChange(from, e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900"
      />
    </div>
  );
}
