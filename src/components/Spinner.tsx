type SpinnerProps = {
  size?: number;
};

export function Spinner({ size = 16 }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="loading"
      className="inline-block animate-spin rounded-full border-2 border-current/25 border-t-current"
      style={{ width: size, height: size }}
    />
  );
}
