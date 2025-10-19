/**
 * Core error handling exports
 *
 * Feature-specific errors should be imported directly from their respective modules:
 * - Auth errors: @/features/auth/lib/errors
 * - Post errors: @/features/posts/lib/errors
 * - etc.
 *
 * Base errors are available here for common use cases.
 */

export { AppError } from './app-error';
export { BaseErrorDefinitions } from './definitions';
export type { HttpStatusCode } from '@/lib/http-status';
