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
  verificationRequiredForPasswordReset:
    'verification-required-for-password-reset',
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
  invalidFields: 'errors.invalid-fields',
  emailRequired: 'errors.email-required',
  emailInvalid: 'errors.email-invalid',
  passwordRequired: 'errors.password-required',
  passwordTooShort: 'errors.password-too-short',
  confirmPasswordRequired: 'errors.confirm-password-required',
  confirmPasswordMismatch: 'errors.confirm-password-mismatch',
  nameRequired: 'errors.name-required',
  nameTooShort: 'errors.name-too-short',

  // Authentication errors
  invalidCredentials: 'errors.invalid-credentials',
  verificationRequired: 'errors.verification-required',
  verificationRequiredForPasswordReset:
    'errors.verification-required-for-password-reset',
  twoFactorRequired: 'errors.two-factor-required',
  twoFactorProvisioningRequired: 'errors.two-factor-provisioning-required',
  callbackError: 'errors.callback-error',
  registrationFailed: 'errors.registration-failed',
  loginFailed: 'errors.login-failed',
  passwordResetFailed: 'errors.password-reset-failed',
  passwordIncorrect: 'errors.password-incorrect',
  passwordUnchanged: 'errors.password-unchanged',
  signupFailed: 'errors.signup-failed',
  verificationFailed: 'errors.verification-failed',
  securitySettingsUpdateFailed: 'errors.security-settings-update-failed',
  profileUpdateFailed: 'errors.profile-update-failed',

  // User errors
  userNotFound: 'errors.user-not-found',
  emailExists: 'errors.email-exists',
  twoFactorSessionMissing: 'errors.two-factor-session-missing',
  oauthNotLinked: 'errors.oauth-not-linked',

  // Token errors
  tokenInvalid: 'errors.token-invalid',
  tokenExpired: 'errors.token-expired',
  twoFactorCodeInvalid: 'errors.two-factor-code-invalid',
  twoFactorCodeExpired: 'errors.two-factor-code-expired',
  twoFactorMaxAttempts: 'errors.two-factor-max-attempts',
  rateLimitExceeded: 'errors.rate-limit-exceeded',
} as const;

/**
 * Auth success messages (i18n keys)
 * Confirmation messages for successful operations
 */
export const AUTH_SUCCESS = {
  emailVerified: 'success.email-verified',
  login: 'success.login',
  passwordResetSent: 'success.password-reset-sent',
  passwordUpdated: 'success.password-updated',
  profileUpdated: 'success.profile-updated',
  signup: 'success.signup',
  twoFactorSent: 'success.two-factor-sent',
  twoFactorVerified: 'success.two-factor-verified',
  verificationSent: 'success.verification-sent',
} as const;

/**
 * Auth info messages (i18n keys)
 * General informational messages, status updates, and transient UI feedback
 */
export const AUTH_INFO = {
  savingPreferences: 'info.saving-preferences',
  noChangesToSave: 'info.no-changes-to-save',
  updatingSecuritySettings: 'info.updating-security-settings',
  updatingPassword: 'info.updating-password',
  updatingProfile: 'info.updating-profile',
  twoFactorEnabled: 'info.two-factor-enabled',
  twoFactorDisabled: 'info.two-factor-disabled',
} as const;

/**
 * Auth UI labels (i18n keys)
 * Static UI text: titles, labels, placeholders, buttons, links
 */
export const AUTH_LABELS = {
  // Page titles
  signupTitle: 'labels.signup-title',
  loginTitle: 'labels.login-title',
  verificationTitle: 'labels.verification-title',
  verify2faTitle: 'labels.verify-2fa-title',
  forgotPasswordTitle: 'labels.forgot-password-title',
  newPasswordTitle: 'labels.new-password-title',
  changePasswordTitle: 'labels.change-password-title',
  twoFactorTitle: 'labels.two-factor-title',
  profileTitle: 'labels.profile-title',

  // Page subtitles
  signupSubtitle: 'labels.signup-subtitle',
  loginSubtitle: 'labels.login-subtitle',
  verificationSubtitle: 'labels.verification-subtitle',
  verify2faSubtitle: 'labels.verify-2fa-subtitle',
  verify2faDescription: 'labels.verify-2fa-description',
  verify2faCodeSent: 'labels.verify-2fa-code-sent',
  verificationSuccessSubtitle: 'labels.verification-success-subtitle',
  verificationFailedSubtitle: 'labels.verification-failed-subtitle',
  verificationProcessingSubtitle: 'labels.verification-processing-subtitle',
  forgotPasswordSubtitle: 'labels.forgot-password-subtitle',
  newPasswordSubtitle: 'labels.new-password-subtitle',
  changePasswordDescription: 'labels.change-password-description',
  twoFactorDescription: 'labels.two-factor-description',
  profileDescription: 'labels.profile-description',

  // Form field labels
  email: 'labels.email',
  name: 'labels.name',
  password: 'labels.password',
  currentPassword: 'labels.current-password',
  confirmPassword: 'labels.confirm-password',
  newPassword: 'labels.new-password',
  twoFactorToggle: 'labels.two-factor-toggle',
  otpCode: 'labels.otp-code',

  // Form placeholders
  emailPlaceholder: 'labels.email-placeholder',
  namePlaceholder: 'labels.name-placeholder',
  passwordPlaceholder: 'labels.password-placeholder',
  confirmPasswordPlaceholder: 'labels.confirm-password-placeholder',
  newPasswordPlaceholder: 'labels.new-password-placeholder',
  otpPlaceholder: 'labels.otp-placeholder',

  // Field descriptions/hints
  nameDescription: 'labels.name-description',
  emailDescription: 'labels.email-description',
  passwordDescription: 'labels.password-description',
  emailResetDescription: 'labels.email-reset-description',
  currentPasswordDescription: 'labels.current-password-description',
  twoFactorToggleDescription: 'labels.two-factor-toggle-description',
  avatarDescription: 'labels.avatar-description',
  emailManagedDescription: 'labels.email-managed-description',
  emailNotificationsDescription: 'labels.email-notifications-description',
  contactSupportDescription: 'labels.contact-support-description',

  // Buttons
  loginButton: 'labels.login-button',
  signupButton: 'labels.signup-button',
  newPasswordButton: 'labels.new-password-button',
  backToLoginButton: 'labels.back-to-login-button',
  verifyEmailButton: 'labels.verify-email-button',
  verifyButton: 'labels.verify-button',
  resendCodeButton: 'labels.resend-code-button',
  resetPasswordButton: 'labels.reset-password-button',
  updatePasswordButton: 'labels.update-password-button',
  saveChangesButton: 'labels.save-changes-button',
  changeAvatarButton: 'labels.change-avatar-button',
  randomButton: 'labels.random-button',

  // Links and CTAs
  signupCtaText: 'labels.signup-cta-text',
  signupCtaLink: 'labels.signup-cta-link',
  loginCtaText: 'labels.login-cta-text',
  loginCtaLink: 'labels.login-cta-link',
  forgotPasswordLink: 'labels.forgot-password-link',
  rememberPasswordCtaText: 'labels.remember-password-cta-text',
  rememberPasswordLink: 'labels.remember-password-link',

  // Other UI text
  orContinueWith: 'labels.or-continue-with',
  verificationSuccessTitle: 'labels.verification-success-title',
  verificationFailedTitle: 'labels.verification-failed-title',
  verificationProcessingTitle: 'labels.verification-processing-title',
} as const;
