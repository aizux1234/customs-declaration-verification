import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type AlertTone = 'error' | 'warning' | 'info' | 'success';

type AlertProps = {
  tone: AlertTone;
  children: ReactNode;
  variant: 'inline' | 'banner';
  onRetry?: () => void;
};

const toneClasses: Record<AlertTone, string> = {
  error: 'bg-danger-soft text-danger-text border-danger',
  warning: 'bg-warning-soft text-warning-text border-warning',
  info: 'bg-info-soft text-info-text border-info',
  success: 'bg-success-soft text-success-text border-success',
};

const toneIcon: Record<AlertTone, LucideIcon> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

export function Alert({ tone, children, variant, onRetry }: AlertProps) {
  const sizing =
    variant === 'banner'
      ? 'w-full px-4 py-3 text-sm'
      : 'px-3 py-2 text-xs';
  const Icon = toneIcon[tone];
  const iconSize = variant === 'banner' ? 18 : 14;
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-md border-l-4 ${toneClasses[tone]} ${sizing}`}
    >
      <span className="flex items-center gap-2">
        <Icon size={iconSize} className="shrink-0" />
        <span>{children}</span>
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded border border-current px-2 py-0.5 text-xs font-medium transition-colors hover:bg-black/5"
        >
          ลองใหม่
        </button>
      )}
    </div>
  );
}
