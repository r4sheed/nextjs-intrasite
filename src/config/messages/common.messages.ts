/**
 * Global message keys for common and database-related errors.
 * Use these keys with your i18n system to render localized text.
 */

export const COMMON_ERRORS = {
  UNEXPECTED_ERROR: 'common.errors.unexpected',
  NETWORK_ERROR: 'common.errors.network',
} as const;

export const DB_MESSAGES = {
  CONNECTION_ERROR: 'db.connection_error',
  QUERY_ERROR: 'db.query_error',
} as const;
