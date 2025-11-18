/**
 * Navigation feature string constants
 * Error codes, messages, and UI labels
 *
 * @see .github/instructions/messages-and-codes.instructions.md
 */

/**
 * Navigation error codes (kebab-case, URL-friendly)
 * Used in AppError code field and URL parameters
 */
export const NAVIGATION_CODES = {
  notFound: 'not-found',
  invalidInput: 'invalid-input',
  // Add more error codes here
} as const;

export type NavigationCode =
  (typeof NAVIGATION_CODES)[keyof typeof NAVIGATION_CODES];

/**
 * Navigation error messages (i18n keys)
 * User-facing error messages for forms, toasts, error pages
 */
export const NAVIGATION_ERRORS = {
  notFound: 'navigation.errors.not-found',
  invalidInput: 'navigation.errors.invalid-input',
  // Add more error messages here
} as const;

/**
 * Navigation success messages (i18n keys)
 * Confirmation messages for successful operations
 */
export const NAVIGATION_SUCCESS = {
  created: 'navigation.success.created',
  updated: 'navigation.success.updated',
  deleted: 'navigation.success.deleted',
} as const;

/**
 * Navigation UI labels (i18n keys)
 * Static UI text: titles, labels, placeholders, buttons
 */
export const NAVIGATION_LABELS = {
  homeTitle: 'labels.home-title',
  errorTitle: 'labels.error-title',
  adminTitle: 'labels.admin-title',
  loginTitle: 'labels.login-title',
  signUpTitle: 'labels.sign-up-title',
  logoutTitle: 'labels.logout-title',
  forgotPasswordTitle: 'labels.forgot-password-title',
  newPasswordTitle: 'labels.new-password-title',
  verifyEmailTitle: 'labels.verify-email-title',
  accountTitle: 'labels.account-title',
  clientTitle: 'labels.client-title',
  serverTitle: 'labels.server-title',
  settingsTitle: 'labels.settings-title',
  menuTitle: 'labels.menu-title',
  toggleMenuLabel: 'labels.toggle-menu-label',
} as const;
