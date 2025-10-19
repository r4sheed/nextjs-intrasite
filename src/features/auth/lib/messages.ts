/**
 * Auth feature message keys and error codes.
 * Use these keys with the i18n system to render localized text.
 */
export const AUTH_ERROR_CODES = {
  INVALID_FIELDS: 'INVALID_FIELDS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_FIELDS: 'auth.errors.invalid_fields',
  INVALID_CREDENTIALS: 'auth.errors.invalid_credentials',
  EMAIL_ALREADY_EXISTS: 'auth.errors.email_already_exists',
  UNEXPECTED_ERROR: 'auth.errors.unexpected_error',
} as const;

export const AUTH_UI_MESSAGES = {
  REGISTER_TITLE: 'auth.ui.register_title',
  LOGIN_TITLE: 'auth.ui.login_title',
  REGISTER_SUBTITLE: 'auth.ui.register_subtitle',
  LOGIN_SUBTITLE: 'auth.ui.login_subtitle',
  EMAIL_LABEL: 'auth.ui.email_label',
  NAME_LABEL: 'auth.ui.name_label',
  PASSWORD_LABEL: 'auth.ui.password_label',
  FORGOT_PASSWORD: 'auth.ui.forgot_password',
  LOGIN_BUTTON: 'auth.ui.login_button',
  REGISTER_BUTTON: 'auth.ui.register_button',
  SIGNUP_CTA_TEXT: 'auth.ui.signup_cta_text',
  SIGNUP_CTA_LINK: 'auth.ui.signup_cta_link',
  LOGIN_CTA_TEXT: 'auth.ui.login_cta_text',
  LOGIN_CTA_LINK: 'auth.ui.login_cta_link',
  PLACEHOLDER_EMAIL: 'auth.ui.placeholder_email',
  PLACEHOLDER_NAME: 'auth.ui.placeholder_name',
  PLACEHOLDER_PASSWORD: 'auth.ui.placeholder_password',
  SUCCESS_LOGIN: 'auth.success.login',
  LOGIN_FAILED: 'auth.errors.login_failed',
  REGISTER_FAILED: 'auth.errors.register_failed',
  SUCCESS_REGISTER: 'auth.success.register',
} as const;
