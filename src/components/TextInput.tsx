import { useId } from 'react';

type TextInputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
};

export function TextInput({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  readOnly,
}: TextInputProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-navy-700">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        className={`w-full rounded-md border px-3 py-2 text-sm text-navy-900 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100 ${
          error ? 'border-danger' : 'border-navy-200'
        } ${readOnly ? 'bg-navy-50' : 'bg-white'}`}
      />
      {error && <span className="mt-1 text-sm text-danger-text">{error}</span>}
    </div>
  );
}
