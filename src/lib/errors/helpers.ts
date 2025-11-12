import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { CORE_CODES } from './codes';
import { CORE_ERRORS } from './messages';

/**
 * These functional helpers create AppError instances for common, core application issues.
 */

/**
 * 500 - Generic internal server error.
 * @returns AppError with status 500.
 */
export const internalServerError = () =>
  new AppError({
    code: CORE_CODES.internalServerError,
    message: { key: CORE_ERRORS.internalServerError },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });

/**
 * 422 - Validation error.
 * Used when input data validation (e.g., Zod schema check) fails.
 * @param details The raw validation errors (e.g., ZodError object) or a custom error structure.
 * @returns AppError with status 422.
 */
export const validationFailed = (details: unknown) =>
  new AppError({
    code: CORE_CODES.validationFailed,
    message: { key: CORE_ERRORS.validationFailed },
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
    code: CORE_CODES.unauthorized,
    message: { key: CORE_ERRORS.unauthorized },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  });

/**
 * 403 - Authorization error.
 * Used when the user is authenticated but lacks necessary permissions.
 * @returns AppError with status 403.
 */
export const forbidden = () =>
  new AppError({
    code: CORE_CODES.forbidden,
    message: { key: CORE_ERRORS.forbidden },
    httpStatus: HTTP_STATUS.FORBIDDEN,
  });

/**
 * 404 - Resource not found.
 * @param resource The type or identifier of the resource that was not found (e.g., 'User', 'Post ID 42').
 * @returns AppError with status 404.
 */
export const notFound = (resource: string) =>
  new AppError({
    code: CORE_CODES.notFound,
    message: { key: CORE_ERRORS.notFound, params: { resource } },
    httpStatus: HTTP_STATUS.NOT_FOUND,
    details: { resource },
  });

/**
 * 500 - Database error.
 * Should be used when catching low-level database exceptions (e.g., ORM errors).
 * @param details The original database error or additional context.
 * @returns AppError with status 500.
 */
export const databaseError = (details?: unknown) =>
  new AppError({
    code: CORE_CODES.databaseError,
    message: { key: CORE_ERRORS.databaseError },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details,
  });
