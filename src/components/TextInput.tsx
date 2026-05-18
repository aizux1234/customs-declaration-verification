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
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        className={`rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${readOnly ? 'bg-gray-50' : 'bg-white'}`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
