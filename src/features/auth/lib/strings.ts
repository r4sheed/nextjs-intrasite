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
  twoFactorRequired: 'two-factor-required',
  twoFactorSessionMissing: 'two-factor-session-missing',
  twoFactorProvisioningRequired: 'two-factor-provisioning-required',
  callbackError: 'callback-error',
  registrationFailed: 'registration-failed',
  loginFailed: 'login-failed',
  passwordResetFailed: 'password-reset-failed',
  passwordIncorrect: 'password-incorrect',
  passwordUnchanged: 'password-unchanged',
  signupFailed: 'signup-failed',
  verificationFailed: 'verification-failed',

  // User errors
  userNotFound: 'user-not-found',
  emailExists: 'email-exists',
  oauthNotLinked: 'oauth-not-linked',

  // Token errors
  tokenInvalid: 'token-invalid',
  tokenExpired: 'token-expired',
  twoFactorCodeInvalid: 'two-factor-code-invalid',
  twoFactorCodeExpired: 'two-factor-code-expired',
  twoFactorMaxAttempts: 'two-factor-max-attempts',
  rateLimitExceeded: 'rate-limit-exceeded',
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
  twoFactorRequired: 'auth.errors.two-factor-required',
  twoFactorProvisioningRequired: 'auth.errors.two-factor-provisioning-required',
  callbackError: 'auth.errors.callback-error',
  registrationFailed: 'auth.errors.registration-failed',
  loginFailed: 'auth.errors.login-failed',
  passwordResetFailed: 'auth.errors.password-reset-failed',
  passwordIncorrect: 'auth.errors.password-incorrect',
  passwordUnchanged: 'auth.errors.password-unchanged',
  signupFailed: 'auth.errors.signup-failed',
  verificationFailed: 'auth.errors.verification-failed',
  securitySettingsUpdateFailed: 'auth.errors.security-settings-update-failed',

  // User errors
  userNotFound: 'auth.errors.user-not-found',
  emailExists: 'auth.errors.email-exists',
  twoFactorSessionMissing: 'auth.errors.two-factor-session-missing',
  oauthNotLinked: 'auth.errors.oauth-not-linked',

  // Token errors
  tokenInvalid: 'auth.errors.token-invalid',
  tokenExpired: 'auth.errors.token-expired',
  twoFactorCodeInvalid: 'auth.errors.two-factor-code-invalid',
  twoFactorCodeExpired: 'auth.errors.two-factor-code-expired',
  twoFactorMaxAttempts: 'auth.errors.two-factor-max-attempts',
  rateLimitExceeded: 'auth.errors.rate-limit-exceeded',
} as const;

/**
 * Auth success messages (i18n keys)
 * Confirmation messages for successful operations
 */
export const AUTH_SUCCESS = {
  emailVerified: 'auth.success.email-verified',
  login: 'auth.success.login',
  passwordResetSent: 'auth.success.password-reset-sent',
  passwordUpdated: 'auth.success.password-updated',
  signup: 'auth.success.signup',
  twoFactorSent: 'auth.success.two-factor-sent',
  twoFactorVerified: 'auth.success.two-factor-verified',
  verificationSent: 'auth.success.verification-sent',
} as const;

/**
 * Auth info messages (i18n keys)
 * General informational messages, status updates, and transient UI feedback
 */
export const AUTH_INFO = {
  savingPreferences: 'auth.info.saving-preferences',
  noChangesToSave: 'auth.info.no-changes-to-save',
  updatingSecuritySettings: 'auth.info.updating-security-settings',
  updatingPassword: 'auth.info.updating-password',
  twoFactorEnabled: 'auth.info.two-factor-enabled',
  twoFactorDisabled: 'auth.info.two-factor-disabled',
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
  verify2faTitle: 'auth.labels.verify-2fa-title',
  forgotPasswordTitle: 'auth.labels.forgot-password-title',
  newPasswordTitle: 'auth.labels.new-password-title',
  changePasswordTitle: 'auth.labels.change-password-title',
  twoFactorTitle: 'auth.labels.two-factor-title',

  // Page subtitles
  signupSubtitle: 'auth.labels.signup-subtitle',
  loginSubtitle: 'auth.labels.login-subtitle',
  verificationSubtitle: 'auth.labels.verification-subtitle',
  verify2faSubtitle: 'auth.labels.verify-2fa-subtitle',
  verify2faDescription: 'auth.labels.verify-2fa-description',
  verify2faCodeSent: 'auth.labels.verify-2fa-code-sent',
  verificationSuccessSubtitle: 'auth.labels.verification-success-subtitle',
  verificationFailedSubtitle: 'auth.labels.verification-failed-subtitle',
  verificationProcessingSubtitle:
    'auth.labels.verification-processing-subtitle',
  forgotPasswordSubtitle: 'auth.labels.forgot-password-subtitle',
  newPasswordSubtitle: 'auth.labels.new-password-subtitle',
  changePasswordDescription: 'auth.labels.change-password-description',
  twoFactorDescription: 'auth.labels.two-factor-description',

  // Form field labels
  emailLabel: 'auth.labels.email',
  nameLabel: 'auth.labels.name',
  passwordLabel: 'auth.labels.password',
  currentPasswordLabel: 'auth.labels.current-password',
  confirmPasswordLabel: 'auth.labels.confirm-password',
  newPasswordLabel: 'auth.labels.new-password',
  twoFactorToggleLabel: 'auth.labels.two-factor-toggle',
  otpLabel: 'auth.labels.otp-code',

  // Form placeholders
  emailPlaceholder: 'auth.labels.email-placeholder',
  namePlaceholder: 'auth.labels.name-placeholder',
  passwordPlaceholder: 'auth.labels.password-placeholder',
  confirmPasswordPlaceholder: 'auth.labels.confirm-password-placeholder',
  newPasswordPlaceholder: 'auth.labels.new-password-placeholder',
  otpPlaceholder: 'auth.labels.otp-placeholder',

  // Field descriptions/hints
  nameDescription: 'auth.labels.name-description',
  emailDescription: 'auth.labels.email-description',
  passwordDescription: 'auth.labels.password-description',
  emailResetDescription: 'auth.labels.email-reset-description',
  currentPasswordDescription: 'auth.labels.current-password-description',
  twoFactorToggleDescription: 'auth.labels.two-factor-toggle-description',

  // Buttons
  loginButton: 'auth.labels.login-button',
  signupButton: 'auth.labels.signup-button',
  forgotPasswordButton: 'auth.labels.forgot-password-button',
  newPasswordButton: 'auth.labels.new-password-button',
  backToLoginButton: 'auth.labels.back-to-login',
  verifyEmailButton: 'auth.labels.verify-email-button',
  verifyButton: 'auth.labels.verify-button',
  resendCode: 'auth.labels.resend-code',
  resendCodeButton: 'auth.labels.resend-code-button',
  updatePasswordButton: 'auth.labels.update-password-button',
  saveChangesButton: 'auth.labels.save-changes-button',

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
