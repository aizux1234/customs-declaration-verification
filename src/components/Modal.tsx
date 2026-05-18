import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-overlay animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-navy-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="rounded-md p-1 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm text-navy-700">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-navy-100 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
