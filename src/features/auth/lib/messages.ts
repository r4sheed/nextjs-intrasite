/**
 * Centralized i18n keys for auth feature errors/messages
 * This file is referenced by `src/features/auth/lib/errors.ts`
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_FIELDS: 'auth.errors.invalid_fields', // Please check your input and try again.
  INVALID_CREDENTIALS: 'auth.errors.invalid_credentials', // Invalid email or password.
  EMAIL_ALREADY_EXISTS: 'auth.errors.email_already_exists', // This email is already registered.
  OAUTH_ACCOUNT_NOT_LINKED: 'auth.errors.oauth_account_not_linked', // Email already in use with different provider.
  UNEXPECTED_ERROR: 'auth.errors.unexpected_error', // An unexpected error occurred.
  USER_NOT_FOUND: 'auth.errors.user_not_found', // User with email {email} could not be found.
  REGISTRATION_FAILED: 'auth.errors.registration_failed', // Registration failed. Please try again.
  CALLBACK_ERROR: 'auth.errors.callback_error', // Authentication callback failed. Please try again.
  EMAIL_VERIFICATION_REQUIRED: 'auth.errors.email_verification_required', // You need to verify your email before logging in.
} as const;

export const AUTH_UI_MESSAGES = {
  REGISTER_TITLE: 'auth.ui.register_title', // Create an account
  LOGIN_TITLE: 'auth.ui.login_title', // Sign in
  REGISTER_SUBTITLE: 'auth.ui.register_subtitle', // Enter your details to create your account
  LOGIN_SUBTITLE: 'auth.ui.login_subtitle', // Enter your email and password to sign in
  EMAIL_LABEL: 'auth.ui.email_label', // Email
  NAME_LABEL: 'auth.ui.name_label', // Name
  PASSWORD_LABEL: 'auth.ui.password_label', // Password
  FORGOT_PASSWORD: 'auth.ui.forgot_password', // Forgot password?
  LOGIN_BUTTON: 'auth.ui.login_button', // Sign in
  REGISTER_BUTTON: 'auth.ui.register_button', // Create account
  SIGNUP_CTA_TEXT: 'auth.ui.signup_cta_text', // Don't have an account?
  SIGNUP_CTA_LINK: 'auth.ui.signup_cta_link', // Sign up
  LOGIN_CTA_TEXT: 'auth.ui.login_cta_text', // Already have an account?
  LOGIN_CTA_LINK: 'auth.ui.login_cta_link', // Sign in
  PLACEHOLDER_EMAIL: 'auth.ui.placeholder_email', // Enter your email
  PLACEHOLDER_NAME: 'auth.ui.placeholder_name', // Enter your name
  PLACEHOLDER_PASSWORD: 'auth.ui.placeholder_password', // Enter your password
  NAME_DESCRIPTION: 'auth.ui.name_description', // Your public display name.
  EMAIL_DESCRIPTION: 'auth.ui.email_description', // We'll use this to contact you. We will not share your email with anyone else.
  PASSWORD_DESCRIPTION: 'auth.ui.password_description', // Must be at least 8 characters long.
  OR_CONTINUE_WITH: 'auth.ui.or_continue_with', // Or continue with
  SUCCESS_LOGIN: 'auth.success.login', // Welcome back!
  LOGIN_FAILED: 'auth.errors.login_failed', // Login failed. Please try again.
  REGISTER_FAILED: 'auth.errors.register_failed', // Registration failed. Please try again.
  SUCCESS_REGISTER: 'auth.success.register', // Account created successfully!
  EMAIL_VERIFICATION_SENT: 'auth.success.email_verification_sent', // A verification email has been sent to your address ({email}). Please check your inbox and follow the instructions to verify your account.
} as const;
