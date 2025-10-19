import { AppError } from '@/lib/errors/app-error';
import { HTTP_STATUS } from '@/lib/http-status';

/**
 * Auth-specific error definitions
 * Extend base errors without modifying core files
 */
export const AuthErrorDefinitions = {
  INVALID_CREDENTIALS: new AppError({
    code: 'AUTH_INVALID_CREDENTIALS',
    message: { key: 'auth.errors.invalid_credentials' },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  }),

  EMAIL_IN_USE: new AppError({
    code: 'AUTH_EMAIL_IN_USE',
    message: { key: 'auth.errors.email_in_use' },
    httpStatus: HTTP_STATUS.CONFLICT,
  }),

  INVALID_FIELDS: (details: unknown) =>
    new AppError({
      code: 'AUTH_INVALID_FIELDS',
      message: { key: 'auth.errors.invalid_fields' },
      httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      details,
    }),

  USER_NOT_FOUND: (email: string) =>
    new AppError({
      code: 'AUTH_USER_NOT_FOUND',
      message: {
        key: 'auth.errors.user_not_found',
        params: { email },
      },
      httpStatus: HTTP_STATUS.NOT_FOUND,
      details: { email },
    }),

  REGISTRATION_FAILED: new AppError({
    code: 'AUTH_REGISTRATION_FAILED',
    message: { key: 'auth.errors.registration_failed' },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  }),
} as const;
