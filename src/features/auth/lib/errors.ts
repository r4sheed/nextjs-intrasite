import { AUTH_ERROR_MESSAGES } from '@/features/auth/lib/messages';
import { AppError } from '@/lib/errors/app-error';
import { HTTP_STATUS } from '@/lib/http-status';

/**
 * Auth-specific error definitions
 * Extend base errors without modifying core files
 */
export const AuthErrorDefinitions = {
  INVALID_FIELDS: (details: unknown) =>
    new AppError({
      code: 'AUTH_INVALID_FIELDS',
      message: { key: AUTH_ERROR_MESSAGES.INVALID_FIELDS },
      httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      details,
    }),

  INVALID_CREDENTIALS: new AppError({
    code: 'AUTH_INVALID_CREDENTIALS',
    message: { key: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  }),

  EMAIL_ALREADY_EXISTS: new AppError({
    code: 'AUTH_EMAIL_ALREADY_EXISTS',
    message: { key: AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS },
    httpStatus: HTTP_STATUS.CONFLICT,
  }),

  USER_NOT_FOUND: (email: string) =>
    new AppError({
      code: 'AUTH_USER_NOT_FOUND',
      message: {
        key: AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
        params: { email },
      },
      httpStatus: HTTP_STATUS.NOT_FOUND,
      details: { email },
    }),

  REGISTRATION_FAILED: new AppError({
    code: 'AUTH_REGISTRATION_FAILED',
    message: { key: AUTH_ERROR_MESSAGES.REGISTRATION_FAILED },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  }),

  CALLBACK_ERROR: new AppError({
    code: 'AUTH_CALLBACK_ERROR',
    message: { key: AUTH_ERROR_MESSAGES.CALLBACK_ERROR },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  }),

  EMAIL_VERIFICATION_REQUIRED: new AppError({
    code: 'AUTH_EMAIL_VERIFICATION_REQUIRED',
    message: { key: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_REQUIRED },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  }),
} as const;
