import { Inbox } from 'lucide-react';

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Inbox aria-hidden="true" size={40} className="text-navy-300" />
      <p className="text-sm text-navy-500">{message}</p>
    </div>
  );
}
