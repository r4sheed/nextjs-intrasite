import { HTTP_STATUS } from '@/lib/http-status';

import { AppError } from './app-error';

/**
 * Core error definitions used across all features
 * Never modify this file for feature-specific errors
 */
export const CoreErrors = {
  INTERNAL_SERVER_ERROR: new AppError({
    code: 'INTERNAL_SERVER_ERROR',
    message: { key: 'errors.internal_server_error' },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  }),

  VALIDATION_FAILED: (details: unknown) =>
    new AppError({
      code: 'VALIDATION_FAILED',
      message: { key: 'errors.validation_failed' },
      httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      details,
    }),

  UNAUTHORIZED: new AppError({
    code: 'UNAUTHORIZED',
    message: { key: 'errors.unauthorized' },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  }),

  FORBIDDEN: new AppError({
    code: 'FORBIDDEN',
    message: { key: 'errors.forbidden' },
    httpStatus: HTTP_STATUS.FORBIDDEN,
  }),

  NOT_FOUND: (resource: string) =>
    new AppError({
      code: 'NOT_FOUND',
      message: { key: 'errors.not_found', params: { resource } },
      httpStatus: HTTP_STATUS.NOT_FOUND,
      details: { resource },
    }),

  DATABASE_ERROR: (operation: string, identifier: string) =>
    new AppError({
      code: 'DATABASE_ERROR',
      message: {
        key: 'errors.database_error',
        params: { operation, identifier },
      },
      httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      details: { operation, identifier },
    }),
} as const;
