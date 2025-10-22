import { AppError } from '@/lib/errors/app-error';
import { HTTP_STATUS } from '@/lib/http-status';

/**
 * These functional helpers create AppError instances for common, core application issues.
 */

/**
 * 500 - Generic internal server error.
 * @returns AppError with status 500.
 */
export const internalServerError = () =>
  new AppError({
    code: 'INTERNAL_SERVER_ERROR',
    message: { key: 'errors.internal_server_error' },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });

/**
 * 422 - Validation failure.
 * Used when input data validation (e.g., Zod schema check) fails.
 * @param details The raw validation errors (e.g., ZodError object) or a custom error structure.
 * @returns AppError with status 422.
 */
export const validationFailed = (details: unknown) =>
  new AppError({
    code: 'VALIDATION_FAILED',
    message: { key: 'errors.validation_failed' },
    httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    details,
  });

/**
 * 401 - Authentication error.
 * Used when access is denied due to missing or invalid credentials (token).
 * @returns AppError with status 401.
 */
export const unauthorized = () =>
  new AppError({
    code: 'UNAUTHORIZED',
    message: { key: 'errors.unauthorized' },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  });

/**
 * 403 - Authorization error.
 * Used when the user is authenticated but lacks necessary permissions.
 * @returns AppError with status 403.
 */
export const forbidden = () =>
  new AppError({
    code: 'FORBIDDEN',
    message: { key: 'errors.forbidden' },
    httpStatus: HTTP_STATUS.FORBIDDEN,
  });

/**
 * 404 - Resource not found.
 * @param resource The type or identifier of the resource that was not found (e.g., 'User', 'Post ID 42').
 * @returns AppError with status 404.
 */
export const notFound = (resource: string) =>
  new AppError({
    code: 'NOT_FOUND',
    message: { key: 'errors.not_found', params: { resource } },
    httpStatus: HTTP_STATUS.NOT_FOUND,
    details: { resource },
  });

/**
 * 500 - Database error.
 * Should be used when catching low-level database exceptions (e.g., ORM errors).
 * @param operation The database operation that failed (e.g., 'insert', 'update').
 * @param identifier Identifier of the entity involved (e.g., 'user:123').
 * @returns AppError with status 500.
 */
export const databaseError = (operation: string, identifier: string) =>
  new AppError({
    code: 'DATABASE_ERROR',
    message: {
      key: 'errors.database_error',
      params: { operation, identifier },
    },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details: { operation, identifier },
  });

/**
 * 401 - Specific authentication failure (e.g., wrong password/username combination).
 * NOTE: Often used instead of UNAUTHORIZED for login flows.
 * @returns AppError with status 401.
 */
export const invalidCredentials = () =>
  new AppError({
    code: 'INVALID_CREDENTIALS',
    message: { key: 'errors.auth.invalid_credentials' },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  });
