import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
};

export function PasswordInput({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  readOnly,
}: PasswordInputProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-navy-700">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          className={`w-full rounded-md border px-3 py-2 pr-10 text-sm text-navy-900 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100 ${
            error ? 'border-danger' : 'border-navy-200'
          } ${readOnly ? 'bg-navy-50' : 'bg-white'}`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-navy-400 hover:text-navy-700"
        >
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
      {error && <span className="mt-1 text-sm text-danger-text">{error}</span>}
    </div>
  );
}
