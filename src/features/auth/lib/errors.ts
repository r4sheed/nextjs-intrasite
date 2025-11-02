import { type AuthError } from 'next-auth';

import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { AUTH_CODES, AUTH_ERRORS } from './strings';

/**
 * --- AUTHENTICATION ERROR HELPERS ---
 * These functional helpers create feature-specific AppError instances for authentication flows.
 * They should be imported and used directly within auth-related Server Actions or Route Handlers.
 */

/**
 * 422 - Invalid fields error.
 * Used for detailed client-side input validation error in auth forms.
 * @param details The raw validation errors (e.g., ZodError object) or a custom error structure.
 * @returns AppError with status 422.
 */
export const invalidFields = (details: unknown) =>
  new AppError({
    code: AUTH_CODES.invalidFields,
    message: { key: AUTH_ERRORS.invalidFields },
    httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    details: details,
  });

/**
 * 401 - Invalid credentials error.
 * Used specifically for login errors (e.g., wrong password or non-existent user).
 * @returns AppError with status 401.
 */
export const invalidCredentials = () =>
  new AppError({
    code: AUTH_CODES.invalidCredentials,
    message: { key: AUTH_ERRORS.invalidCredentials },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  });

/**
 * 404 - User not found error.
 * Used when trying to access or process a user by email, but the user doesn't exist.
 * @param email The email address that could not be found.
 * @returns AppError with status 404.
 */
export const userNotFound = (email: string) =>
  new AppError({
    code: AUTH_CODES.userNotFound,
    message: {
      key: AUTH_ERRORS.userNotFound,
      params: { email },
    },
    httpStatus: HTTP_STATUS.NOT_FOUND,
    details: { email },
  });

/**
 * 409 - Email already exists error.
 * Used during user registration when the email is already in use.
 * @returns AppError with status 409.
 */
export const emailAlreadyExists = () =>
  new AppError({
    code: AUTH_CODES.emailExists,
    message: { key: AUTH_ERRORS.emailExists },
    httpStatus: HTTP_STATUS.CONFLICT,
  });

/**
 * 500 - Registration failed error.
 * Generic error for unexpected server issues during the registration process.
 * @returns AppError with status 500.
 */
export const registrationFailed = (error: unknown) =>
  new AppError({
    code: AUTH_CODES.registrationFailed,
    message: { key: AUTH_ERRORS.registrationFailed },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details: error,
  });

/**
 * 500 - OAuth/Callback error.
 * Error during external provider (OAuth) or internal callback processing.
 * @returns AppError with status 500.
 */
export const callbackError = (error: AuthError) =>
  new AppError({
    code: AUTH_CODES.callbackError,
    message: { key: AUTH_ERRORS.callbackError },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details: error,
  });

/**
 * 401 - Email verification required error.
 * Used when a user attempts to log in but their email address is not yet verified.
 * @returns AppError with status 401.
 */
export const emailVerificationRequired = () =>
  new AppError({
    code: AUTH_CODES.verificationRequired,
    message: { key: AUTH_ERRORS.verificationRequired },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  });

/**
 * 404 - Token not found or invalid.
 * Used when a verification/reset token can't be located or is invalid.
 * @param tokenId Optional token identifier for debugging/details
 */
export const tokenNotFound = (tokenId?: string) =>
  new AppError({
    code: AUTH_CODES.tokenInvalid,
    message: { key: AUTH_ERRORS.tokenInvalid },
    httpStatus: HTTP_STATUS.NOT_FOUND,
    details: tokenId ? { tokenId } : undefined,
  });

/**
 * 410 - Token expired.
 * Used when a token was valid but has passed its expiry time.
 * @param tokenId Optional token identifier for debugging/details
 */
export const tokenExpired = (tokenId?: string) =>
  new AppError({
    code: AUTH_CODES.tokenExpired,
    message: { key: AUTH_ERRORS.tokenExpired },
    httpStatus: HTTP_STATUS.GONE,
    details: tokenId ? { tokenId } : undefined,
  });
