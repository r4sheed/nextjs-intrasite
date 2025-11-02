/**
 * Core error codes for application-wide errors
 * Format: camelCase for URL-friendly usage
 */
export const CORE_CODES = {
  internalServerError: 'internalServerError',
  validationFailed: 'validationFailed',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'notFound',
  databaseError: 'databaseError',
  uncaughtException: 'uncaughtException',
} as const;

export type CoreCode = (typeof CORE_CODES)[keyof typeof CORE_CODES];

/**
 * @deprecated Use CORE_CODES instead
 */
export const ERROR_CODES = CORE_CODES;
