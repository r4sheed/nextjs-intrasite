/**
 * Auth feature string constants - Error codes, messages, and UI labels
 * Centralized location for all auth-related string constants and i18n keys
 *
 * @see .github/instructions/messages-and-codes.instructions.md
 */

/**
 * Auth feature error codes
 * Format: kebab-case, URL-friendly
 * Used in AppError code field and URL parameters
 */
export const AUTH_CODES = {
  // Validation errors
  invalidFields: 'invalid-fields',
  emailRequired: 'email-required',
  emailInvalid: 'email-invalid',
  passwordRequired: 'password-required',
  passwordTooShort: 'password-too-short',
  confirmPasswordRequired: 'confirm-password-required',
  confirmPasswordMismatch: 'confirm-password-mismatch',
  nameRequired: 'name-required',
  nameTooShort: 'name-too-short',

  // Authentication errors
  invalidCredentials: 'invalid-credentials',
  verificationRequired: 'verification-required',
  callbackError: 'callback-error',

  // User errors
  userNotFound: 'user-not-found',
  emailExists: 'email-exists',
  oauthNotLinked: 'oauth-not-linked',

  // Token errors
  tokenInvalid: 'token-invalid',
  tokenExpired: 'token-expired',

  // Operation errors
  registrationFailed: 'registration-failed',
  loginFailed: 'login-failed',
  signupFailed: 'signup-failed',
  passwordUpdateFailed: 'password-update-failed',
  passwordResetFailed: 'password-reset-failed',
  verificationFailed: 'verification-failed',
} as const;

export type AuthCode = (typeof AUTH_CODES)[keyof typeof AUTH_CODES];

/**
 * Auth error messages (i18n keys)
 * User-facing error messages shown in forms, toasts, or error pages
 */
export const AUTH_ERRORS = {
  // Validation errors
  invalidFields: 'auth.errors.invalid-fields',
  emailRequired: 'auth.errors.email-required',
  emailInvalid: 'auth.errors.email-invalid',
  passwordRequired: 'auth.errors.password-required',
  passwordTooShort: 'auth.errors.password-too-short',
  confirmPasswordRequired: 'auth.errors.confirm-password-required',
  confirmPasswordMismatch: 'auth.errors.confirm-password-mismatch',
  nameRequired: 'auth.errors.name-required',
  nameTooShort: 'auth.errors.name-too-short',

  // Authentication errors
  invalidCredentials: 'auth.errors.invalid-credentials',
  verificationRequired: 'auth.errors.verification-required',
  callbackError: 'auth.errors.callback-error',

  // User errors
  userNotFound: 'auth.errors.user-not-found',
  emailExists: 'auth.errors.email-exists',
  oauthNotLinked: 'auth.errors.oauth-not-linked',

  // Token errors
  tokenInvalid: 'auth.errors.token-invalid',
  tokenExpired: 'auth.errors.token-expired',

  // Operation errors
  registrationFailed: 'auth.errors.registration-failed',
  loginFailed: 'auth.errors.login-failed',
  signupFailed: 'auth.errors.signup-failed',
  passwordUpdateFailed: 'auth.errors.password-update-failed',
  passwordResetFailed: 'auth.errors.password-reset-failed',
  verificationFailed: 'auth.errors.verification-failed',
} as const;

/**
 * Auth success messages (i18n keys)
 * Confirmation messages for successful operations
 */
export const AUTH_SUCCESS = {
  login: 'auth.success.login',
  signup: 'auth.success.signup',
  emailVerified: 'auth.success.email-verified',
  verificationSent: 'auth.success.verification-sent',
  passwordUpdated: 'auth.success.password-updated',
  passwordResetSent: 'auth.success.password-reset-sent',
} as const;

/**
 * Auth UI labels (i18n keys)
 * Static UI text: titles, labels, placeholders, buttons, links
 */
export const AUTH_LABELS = {
  // Page titles
  signupTitle: 'auth.labels.signup-title',
  loginTitle: 'auth.labels.login-title',
  verificationTitle: 'auth.labels.verification-title',
  forgotPasswordTitle: 'auth.labels.forgot-password-title',
  newPasswordTitle: 'auth.labels.new-password-title',

  // Page subtitles
  signupSubtitle: 'auth.labels.signup-subtitle',
  loginSubtitle: 'auth.labels.login-subtitle',
  verificationSubtitle: 'auth.labels.verification-subtitle',
  verificationSuccessSubtitle: 'auth.labels.verification-success-subtitle',
  verificationFailedSubtitle: 'auth.labels.verification-failed-subtitle',
  verificationProcessingSubtitle:
    'auth.labels.verification-processing-subtitle',
  forgotPasswordSubtitle: 'auth.labels.forgot-password-subtitle',
  newPasswordSubtitle: 'auth.labels.new-password-subtitle',

  // Form field labels
  emailLabel: 'auth.labels.email',
  nameLabel: 'auth.labels.name',
  passwordLabel: 'auth.labels.password',
  confirmPasswordLabel: 'auth.labels.confirm-password',
  newPasswordLabel: 'auth.labels.new-password',

  // Form placeholders
  emailPlaceholder: 'auth.labels.email-placeholder',
  namePlaceholder: 'auth.labels.name-placeholder',
  passwordPlaceholder: 'auth.labels.password-placeholder',
  confirmPasswordPlaceholder: 'auth.labels.confirm-password-placeholder',
  newPasswordPlaceholder: 'auth.labels.new-password-placeholder',

  // Field descriptions/hints
  nameDescription: 'auth.labels.name-description',
  emailDescription: 'auth.labels.email-description',
  passwordDescription: 'auth.labels.password-description',
  emailResetDescription: 'auth.labels.email-reset-description',

  // Buttons
  loginButton: 'auth.labels.login-button',
  signupButton: 'auth.labels.signup-button',
  forgotPasswordButton: 'auth.labels.forgot-password-button',
  newPasswordButton: 'auth.labels.new-password-button',
  backToLoginButton: 'auth.labels.back-to-login',
  verifyEmailButton: 'auth.labels.verify-email-button',

  // Links and CTAs
  forgotPasswordLink: 'auth.labels.forgot-password',
  signupCtaText: 'auth.labels.signup-cta-text',
  signupCtaLink: 'auth.labels.signup-cta-link',
  loginCtaText: 'auth.labels.login-cta-text',
  loginCtaLink: 'auth.labels.login-cta-link',
  rememberPasswordCta: 'auth.labels.remember-password',

  // Other UI text
  orContinueWith: 'auth.labels.or-continue-with',
  verificationSuccessTitle: 'auth.labels.verification-success-title',
  verificationFailedTitle: 'auth.labels.verification-failed-title',
  verificationProcessingTitle: 'auth.labels.verification-processing-title',
} as const;
