/**
 * Auth feature string constants - Error codes, messages, and UI labels
 * Centralized location for all auth-related string constants and i18n keys
 *
 * @see .github/instructions/messages-and-codes.instructions.md
 */

/**
 * Auth feature error codes
 * Format: camelCase, URL-friendly
 * Used in AppError code field and URL parameters
 */
export const AUTH_CODES = {
  // Validation errors
  invalidFields: 'invalidFields',
  emailRequired: 'emailRequired',
  emailInvalid: 'emailInvalid',
  passwordRequired: 'passwordRequired',
  passwordTooShort: 'passwordTooShort',
  confirmPasswordRequired: 'confirmPasswordRequired',
  confirmPasswordMismatch: 'confirmPasswordMismatch',
  nameRequired: 'nameRequired',
  nameTooShort: 'nameTooShort',

  // Authentication errors
  invalidCredentials: 'invalidCredentials',
  verificationRequired: 'verificationRequired',
  callbackError: 'callbackError',

  // User errors
  userNotFound: 'userNotFound',
  emailExists: 'emailExists',
  oauthNotLinked: 'oauthNotLinked',

  // Token errors
  tokenInvalid: 'tokenInvalid',
  tokenExpired: 'tokenExpired',

  // Operation errors
  registrationFailed: 'registrationFailed',
  loginFailed: 'loginFailed',
  signupFailed: 'signupFailed',
  passwordUpdateFailed: 'passwordUpdateFailed',
  passwordResetFailed: 'passwordResetFailed',
  verificationFailed: 'verificationFailed',
} as const;

export type AuthCode = (typeof AUTH_CODES)[keyof typeof AUTH_CODES];

/**
 * Auth error messages (i18n keys)
 * User-facing error messages shown in forms, toasts, or error pages
 */
export const AUTH_ERRORS = {
  // Validation errors
  invalidFields: 'auth.errors.invalidFields',
  emailRequired: 'auth.errors.emailRequired',
  emailInvalid: 'auth.errors.emailInvalid',
  passwordRequired: 'auth.errors.passwordRequired',
  passwordTooShort: 'auth.errors.passwordTooShort',
  confirmPasswordRequired: 'auth.errors.confirmPasswordRequired',
  confirmPasswordMismatch: 'auth.errors.confirmPasswordMismatch',
  nameRequired: 'auth.errors.nameRequired',
  nameTooShort: 'auth.errors.nameTooShort',

  // Authentication errors
  invalidCredentials: 'auth.errors.invalidCredentials',
  verificationRequired: 'auth.errors.verificationRequired',
  callbackError: 'auth.errors.callbackError',

  // User errors
  userNotFound: 'auth.errors.userNotFound',
  emailExists: 'auth.errors.emailExists',
  oauthNotLinked: 'auth.errors.oauthNotLinked',

  // Token errors
  tokenInvalid: 'auth.errors.tokenInvalid',
  tokenExpired: 'auth.errors.tokenExpired',

  // Operation errors
  registrationFailed: 'auth.errors.registrationFailed',
  loginFailed: 'auth.errors.loginFailed',
  signupFailed: 'auth.errors.signupFailed',
  passwordUpdateFailed: 'auth.errors.passwordUpdateFailed',
  passwordResetFailed: 'auth.errors.passwordResetFailed',
  verificationFailed: 'auth.errors.verificationFailed',
} as const;

/**
 * Auth success messages (i18n keys)
 * Confirmation messages for successful operations
 */
export const AUTH_SUCCESS = {
  login: 'auth.success.login',
  signup: 'auth.success.signup',
  emailVerified: 'auth.success.emailVerified',
  verificationSent: 'auth.success.verificationSent',
  passwordUpdated: 'auth.success.passwordUpdated',
  passwordResetSent: 'auth.success.passwordResetSent',
} as const;

/**
 * Auth UI labels (i18n keys)
 * Static UI text: titles, labels, placeholders, buttons, links
 */
export const AUTH_LABELS = {
  // Page titles
  signupTitle: 'auth.labels.signupTitle',
  loginTitle: 'auth.labels.loginTitle',
  verificationTitle: 'auth.labels.verificationTitle',
  forgotPasswordTitle: 'auth.labels.forgotPasswordTitle',
  newPasswordTitle: 'auth.labels.newPasswordTitle',

  // Page subtitles
  signupSubtitle: 'auth.labels.signupSubtitle',
  loginSubtitle: 'auth.labels.loginSubtitle',
  verificationSubtitle: 'auth.labels.verificationSubtitle',
  verificationSuccessSubtitle: 'auth.labels.verificationSuccessSubtitle',
  verificationFailedSubtitle: 'auth.labels.verificationFailedSubtitle',
  verificationProcessingSubtitle: 'auth.labels.verificationProcessingSubtitle',
  forgotPasswordSubtitle: 'auth.labels.forgotPasswordSubtitle',
  newPasswordSubtitle: 'auth.labels.newPasswordSubtitle',

  // Form field labels
  emailLabel: 'auth.labels.email',
  nameLabel: 'auth.labels.name',
  passwordLabel: 'auth.labels.password',
  confirmPasswordLabel: 'auth.labels.confirmPassword',
  newPasswordLabel: 'auth.labels.newPassword',

  // Form placeholders
  emailPlaceholder: 'auth.labels.emailPlaceholder',
  namePlaceholder: 'auth.labels.namePlaceholder',
  passwordPlaceholder: 'auth.labels.passwordPlaceholder',
  confirmPasswordPlaceholder: 'auth.labels.confirmPasswordPlaceholder',
  newPasswordPlaceholder: 'auth.labels.newPasswordPlaceholder',

  // Field descriptions/hints
  nameDescription: 'auth.labels.nameDescription',
  emailDescription: 'auth.labels.emailDescription',
  passwordDescription: 'auth.labels.passwordDescription',
  emailResetDescription: 'auth.labels.emailResetDescription',

  // Buttons
  loginButton: 'auth.labels.loginButton',
  signupButton: 'auth.labels.signupButton',
  forgotPasswordButton: 'auth.labels.forgotPasswordButton',
  newPasswordButton: 'auth.labels.newPasswordButton',
  backToLoginButton: 'auth.labels.backToLogin',
  verifyEmailButton: 'auth.labels.verifyEmailButton',

  // Links and CTAs
  forgotPasswordLink: 'auth.labels.forgotPassword',
  signupCtaText: 'auth.labels.signupCtaText',
  signupCtaLink: 'auth.labels.signupCtaLink',
  loginCtaText: 'auth.labels.loginCtaText',
  loginCtaLink: 'auth.labels.loginCtaLink',
  rememberPasswordCta: 'auth.labels.rememberPassword',

  // Other UI text
  orContinueWith: 'auth.labels.orContinueWith',
  verificationSuccessTitle: 'auth.labels.verificationSuccess',
  verificationFailedTitle: 'auth.labels.verificationFailed',
  verificationProcessingTitle: 'auth.labels.verificationProcessing',
} as const;
