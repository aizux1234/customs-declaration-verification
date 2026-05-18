import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
};

const variantClasses: Record<ButtonProps['variant'], string> = {
  primary: 'bg-navy text-white hover:bg-navy/90 border border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
  secondary: 'bg-white text-navy border border-gray-300 hover:bg-gray-50',
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
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}
