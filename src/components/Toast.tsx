type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-navy px-4 py-2 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}
