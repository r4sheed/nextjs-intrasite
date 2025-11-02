/**
 * Core error codes for application-wide errors
 * Format: kebab-case for URL-friendly usage
 */
export const CORE_CODES = {
  internalServerError: 'internal-server-error',
  validationFailed: 'validation-failed',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'not-found',
  databaseError: 'database-error',
  uncaughtException: 'uncaught-exception',
} as const;

export type CoreCode = (typeof CORE_CODES)[keyof typeof CORE_CODES];

/**
 * @deprecated Use CORE_CODES instead
 */
export const ERROR_CODES = CORE_CODES;
