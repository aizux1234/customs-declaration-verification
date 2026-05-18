import type { ReactNode } from 'react';

type AlertTone = 'error' | 'warning' | 'info' | 'success';

type AlertProps = {
  tone: AlertTone;
  children: ReactNode;
  variant: 'inline' | 'banner';
  onRetry?: () => void;
};

const toneClasses: Record<AlertTone, string> = {
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-green-50 text-green-800 border-green-200',
};

export function Alert({ tone, children, variant, onRetry }: AlertProps) {
  const sizing =
    variant === 'banner'
      ? 'w-full px-4 py-3 text-sm'
      : 'px-3 py-1.5 text-xs';
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-md border ${toneClasses[tone]} ${sizing}`}
    >
      <span>{children}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded border border-current px-2 py-0.5 text-xs font-medium hover:bg-black/5"
        >
          ลองใหม่
        </button>
      )}
    </div>
  );
}
