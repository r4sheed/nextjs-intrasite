/**
 * Centralized messages for core errors
 */
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'errors.internal_server_error', // An unexpected error occurred. Please try again later.
  VALIDATION_FAILED: 'errors.validation_failed', // Input validation failed. Please check your entries.
  UNAUTHORIZED: 'errors.unauthorized', // You are not authorized to perform this action.
  FORBIDDEN: 'errors.forbidden', // Access forbidden.
  NOT_FOUND: 'errors.not_found', // {resource} could not be found.
  DATABASE_ERROR: 'errors.database_error', // A database error occurred. Please try again later.
} as const;
