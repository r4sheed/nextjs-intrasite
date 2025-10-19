/**
 * Discriminated Result type used across business logic layers.
 * Business logic must never throw — always return Result.
 */
export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };
