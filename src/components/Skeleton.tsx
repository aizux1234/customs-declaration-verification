// src/components/Skeleton.tsx
interface SkeletonProps {
  className?: string;
}

/** Animated grey placeholder block for loading states. */
export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded bg-navy-100 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}
