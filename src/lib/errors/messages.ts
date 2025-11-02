/**
 * Core error messages (i18n keys) for application-wide errors
 */
export const CORE_ERRORS = {
  internalServerError: 'errors.internalServerError',
  validationFailed: 'errors.validationFailed',
  unauthorized: 'errors.unauthorized',
  forbidden: 'errors.forbidden',
  notFound: 'errors.notFound',
  databaseError: 'errors.databaseError',
} as const;

/**
 * @deprecated Use CORE_ERRORS instead
 */
export const ERROR_MESSAGES = CORE_ERRORS;
