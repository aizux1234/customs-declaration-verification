import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
};

const variantClasses: Record<ButtonProps['variant'], string> = {
  primary: 'bg-navy-700 hover:bg-navy-800 text-white border border-transparent',
  danger: 'bg-danger hover:bg-danger-text text-white border border-transparent',
  secondary: 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50',
};

export function Button({
  variant,
  loading = false,
  disabled = false,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}
