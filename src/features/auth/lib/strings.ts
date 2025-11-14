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
  callbackError: 'callback-error',
  confirmPasswordMismatch: 'confirm-password-mismatch',
  confirmPasswordRequired: 'confirm-password-required',
  emailExists: 'email-exists',
  emailInvalid: 'email-invalid',
  emailRequired: 'email-required',
  invalidCredentials: 'invalid-credentials',
  loginFailed: 'login-failed',
  nameRequired: 'name-required',
  nameTooShort: 'name-too-short',
  oauthNotLinked: 'oauth-not-linked',
  passwordIncorrect: 'password-incorrect',
  passwordRequired: 'password-required',
  passwordResetFailed: 'password-reset-failed',
  passwordTooShort: 'password-too-short',
  passwordUnchanged: 'password-unchanged',
  rateLimitExceeded: 'rate-limit-exceeded',
  registrationFailed: 'registration-failed',
  signupFailed: 'signup-failed',
  tokenExpired: 'token-expired',
  tokenInvalid: 'token-invalid',
  twoFactorCodeExpired: 'two-factor-code-expired',
  twoFactorCodeInvalid: 'two-factor-code-invalid',
  twoFactorMaxAttempts: 'two-factor-max-attempts',
  twoFactorProvisioningRequired: 'two-factor-provisioning-required',
  twoFactorRequired: 'two-factor-required',
  twoFactorSessionMissing: 'two-factor-session-missing',
  userNotFound: 'user-not-found',
  verificationFailed: 'verification-failed',
  verificationRequired: 'verification-required',
  verificationRequiredForPasswordReset:
    'verification-required-for-password-reset',
} as const;

export type AuthCode = (typeof AUTH_CODES)[keyof typeof AUTH_CODES];

/**
 * Auth error messages (i18n keys)
 * User-facing error messages shown in forms, toasts, or error pages
 */
export const AUTH_ERRORS = {
  callbackError: 'errors.callback-error',
  confirmPasswordMismatch: 'errors.confirm-password-mismatch',
  confirmPasswordRequired: 'errors.confirm-password-required',
  emailExists: 'errors.email-exists',
  emailInvalid: 'errors.email-invalid',
  emailRequired: 'errors.email-required',
  insufficientPermissions: 'errors.insufficient-permissions',
  invalidCredentials: 'errors.invalid-credentials',
  invalidFields: 'errors.invalid-fields',
  loginFailed: 'errors.login-failed',
  nameRequired: 'errors.name-required',
  nameTooShort: 'errors.name-too-short',
  oauthNotLinked: 'errors.oauth-not-linked',
  passwordIncorrect: 'errors.password-incorrect',
  passwordRequired: 'errors.password-required',
  passwordResetFailed: 'errors.password-reset-failed',
  passwordTooShort: 'errors.password-too-short',
  passwordUnchanged: 'errors.password-unchanged',
  profileUpdateFailed: 'errors.profile-update-failed',
  rateLimitExceeded: 'errors.rate-limit-exceeded',
  registrationFailed: 'errors.registration-failed',
  securitySettingsUpdateFailed: 'errors.security-settings-update-failed',
  signupFailed: 'errors.signup-failed',
  tokenExpired: 'errors.token-expired',
  tokenInvalid: 'errors.token-invalid',
  twoFactorCodeExpired: 'errors.two-factor-code-expired',
  twoFactorCodeInvalid: 'errors.two-factor-code-invalid',
  twoFactorMaxAttempts: 'errors.two-factor-max-attempts',
  twoFactorProvisioningRequired: 'errors.two-factor-provisioning-required',
  twoFactorRequired: 'errors.two-factor-required',
  twoFactorSessionMissing: 'errors.two-factor-session-missing',
  userNotFound: 'errors.user-not-found',
  verificationFailed: 'errors.verification-failed',
  verificationRequired: 'errors.verification-required',
  verificationRequiredForPasswordReset:
    'errors.verification-required-for-password-reset',
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
  noChangesToSave: 'info.no-changes-to-save',
  savingPreferences: 'info.saving-preferences',
  twoFactorDisabled: 'info.two-factor-disabled',
  twoFactorEnabled: 'info.two-factor-enabled',
  updatingPassword: 'info.updating-password',
  updatingProfile: 'info.updating-profile',
  updatingSecuritySettings: 'info.updating-security-settings',
} as const;

/**
 * Auth UI labels (i18n keys)
 * Static UI text: titles, labels, placeholders, buttons, links
 */
export const AUTH_LABELS = {
  advancedTab: 'labels.advanced-tab',
  appearanceTab: 'labels.appearance-tab',
  avatarDescription: 'labels.avatar-description',
  backToLoginButton: 'labels.back-to-login-button',
  changeAvatarButton: 'labels.change-avatar-button',
  changePasswordDescription: 'labels.change-password-description',
  changePasswordTitle: 'labels.change-password-title',
  confirmPassword: 'labels.confirm-password',
  confirmPasswordPlaceholder: 'labels.confirm-password-placeholder',
  contactSupportDescription: 'labels.contact-support-description',
  currentPassword: 'labels.current-password',
  currentPasswordDescription: 'labels.current-password-description',
  email: 'labels.email',
  emailDescription: 'labels.email-description',
  emailManagedDescription: 'labels.email-managed-description',
  emailNotificationsDescription: 'labels.email-notifications-description',
  emailPlaceholder: 'labels.email-placeholder',
  emailResetDescription: 'labels.email-reset-description',
  forgotPasswordLink: 'labels.forgot-password-link',
  forgotPasswordSubtitle: 'labels.forgot-password-subtitle',
  forgotPasswordTitle: 'labels.forgot-password-title',
  generalGroupTitle: 'labels.general-group-title',
  hidePassword: 'labels.hide-password',
  loginButton: 'labels.login-button',
  loginCtaLink: 'labels.login-cta-link',
  loginCtaText: 'labels.login-cta-text',
  loginSubtitle: 'labels.login-subtitle',
  loginTitle: 'labels.login-title',
  name: 'labels.name',
  nameDescription: 'labels.name-description',
  namePlaceholder: 'labels.name-placeholder',
  newPassword: 'labels.new-password',
  newPasswordButton: 'labels.new-password-button',
  newPasswordPlaceholder: 'labels.new-password-placeholder',
  newPasswordSubtitle: 'labels.new-password-subtitle',
  newPasswordTitle: 'labels.new-password-title',
  notificationsTab: 'labels.notifications-tab',
  orContinueWith: 'labels.or-continue-with',
  otpCode: 'labels.otp-code',
  otpPlaceholder: 'labels.otp-placeholder',
  password: 'labels.password',
  passwordDescription: 'labels.password-description',
  passwordPlaceholder: 'labels.password-placeholder',
  personalizationGroupTitle: 'labels.personalization-group-title',
  profileDescription: 'labels.profile-description',
  profileTab: 'labels.profile-tab',
  profileTitle: 'labels.profile-title',
  randomButton: 'labels.random-button',
  rememberPasswordCtaText: 'labels.remember-password-cta-text',
  rememberPasswordLink: 'labels.remember-password-link',
  resendCodeButton: 'labels.resend-code-button',
  resetPasswordButton: 'labels.reset-password-button',
  saveChangesButton: 'labels.save-changes-button',
  securityTab: 'labels.security-tab',
  settingsDescription: 'labels.settings-description',
  settingsSidebarDescription: 'labels.settings-sidebar-description',
  settingsSidebarTitle: 'labels.settings-sidebar-title',
  settingsTitle: 'labels.settings-title',
  showPassword: 'labels.show-password',
  signInWithGithubButton: 'labels.sign-in-with-github-button',
  signInWithGoogleButton: 'labels.sign-in-with-google-button',
  signupButton: 'labels.signup-button',
  signupCtaLink: 'labels.signup-cta-link',
  signupCtaText: 'labels.signup-cta-text',
  signupSubtitle: 'labels.signup-subtitle',
  signupTitle: 'labels.signup-title',
  systemGroupTitle: 'labels.system-group-title',
  twoFactorDescription: 'labels.two-factor-description',
  twoFactorTitle: 'labels.two-factor-title',
  twoFactorToggle: 'labels.two-factor-toggle',
  twoFactorToggleDescription: 'labels.two-factor-toggle-description',
  updatePasswordButton: 'labels.update-password-button',
  verifyEmailFailedSubtitle: 'labels.verify-email-failed-subtitle',
  verifyEmailFailedTitle: 'labels.verify-email-failed-title',
  verifyEmailProcessingSubtitle: 'labels.verify-email-processing-subtitle',
  verifyEmailProcessingTitle: 'labels.verify-email-processing-title',
  verifyEmailSubtitle: 'labels.verify-email-subtitle',
  verifyEmailSuccessSubtitle: 'labels.verify-email-success-subtitle',
  verifyEmailSuccessTitle: 'labels.verify-email-success-title',
  verifyEmailTitle: 'labels.verify-email-title',
  verify2faCodeSent: 'labels.verify-2fa-code-sent',
  verify2faDescription: 'labels.verify-2fa-description',
  verify2faSubtitle: 'labels.verify-2fa-subtitle',
  verify2faTitle: 'labels.verify-2fa-title',
  verifyButton: 'labels.verify-button',
  verifyEmailButton: 'labels.verify-email-button',
} as const;
