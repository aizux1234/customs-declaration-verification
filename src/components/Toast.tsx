type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-navy-800 px-4 py-3 text-sm text-white shadow-overlay animate-slide-in-right">
      {message}
    </div>
  );
}
