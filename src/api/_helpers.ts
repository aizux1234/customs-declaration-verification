// src/api/_helpers.ts
/** Simulate network latency so the UI exercises real loading states. */
export function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
