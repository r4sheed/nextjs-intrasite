/**
 * Centralized messages for auth feature errors
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_FIELDS: 'auth.errors.invalid_fields', // Please check your input and try again.
  EMAIL_REQUIRED: 'auth.errors.email_required', // Email is required
  EMAIL_INVALID: 'auth.errors.email_invalid', // Invalid email address
  PASSWORD_REQUIRED: 'auth.errors.password_required', // Password is required
  PASSWORD_TOO_SHORT: 'auth.errors.password_too_short', // Password must be at least {min} characters long
  NAME_REQUIRED: 'auth.errors.name_required', // Name is required
  NAME_TOO_SHORT: 'auth.errors.name_too_short', // Name must be at least {min} characters long
  INVALID_CREDENTIALS: 'auth.errors.invalid_credentials', // Invalid email or password.
  EMAIL_ALREADY_EXISTS: 'auth.errors.email_already_exists', // This email is already registered.
  OAUTH_ACCOUNT_NOT_LINKED: 'auth.errors.oauth_account_not_linked', // Email already in use with different provider.
  UNEXPECTED_ERROR: 'auth.errors.unexpected_error', // An unexpected error occurred.
  USER_NOT_FOUND: 'auth.errors.user_not_found', // User with email {email} could not be found.
  REGISTRATION_FAILED: 'auth.errors.registration_failed', // Registration failed. Please try again.
  CALLBACK_ERROR: 'auth.errors.callback_error', // Authentication callback failed. Please try again.
  EMAIL_VERIFICATION_REQUIRED: 'auth.errors.email_verification_required', // You need to verify your email before logging in.
  TOKEN_NOT_FOUND: 'auth.errors.token_not_found', // Token not found or invalid.
  TOKEN_EXPIRED: 'auth.errors.token_expired', // The token has expired.
} as const;

export const AUTH_UI_MESSAGES = {
  REGISTER_TITLE: 'auth.ui.register_title', // Create an account
  LOGIN_TITLE: 'auth.ui.login_title', // Sign in
  EMAIL_VERIFICATION_TITLE: 'auth.ui.email_verification', // Email verification
  REGISTER_SUBTITLE: 'auth.ui.register_subtitle', // Enter your details to create your account
  LOGIN_SUBTITLE: 'auth.ui.login_subtitle', // Enter your email and password to sign in
  EMAIL_VERIFICATION_SUBTITLE: 'auth.ui.email_verification_subtitle', // Confirming your verification
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
  EMAIL_VERIFIED: 'auth.success.email_verified', // Email verified! You can now log in.
  VERIFICATION_SUCCESS_TITLE: 'auth.ui.verification_success_title', // Verification Success
  VERIFICATION_FAILED_TITLE: 'auth.ui.verification_failed_title', // Verification Failed
  VERIFICATION_PROCESSING_TITLE: 'auth.ui.verification_processing_title', // Processing Request
  VERIFICATION_PROCESSING_DESCRIPTION:
    'auth.ui.verification_processing_description', // Please wait while we verify your email...
  BACK_TO_LOGIN_BUTTON: 'auth.ui.back_to_login_button', // Back to login
  FORGOT_PASSWORD_TITLE: 'auth.ui.forgot_password_title', // Forgot password
  FORGOT_PASSWORD_SUBTITLE: 'auth.ui.forgot_password_subtitle', // Enter your email to get reset instructions
  FORGOT_PASSWORD_BUTTON: 'auth.ui.forgot_password_button', // Reset password
  RESET_EMAIL_SENT: 'auth.success.reset_email_sent', // If an account with that email exists, a password reset link has been sent.
  NEW_PASSWORD_TITLE: 'auth.ui.new_password_title', // Create a new password
  NEW_PASSWORD_SUBTITLE: 'auth.ui.new_password_subtitle', // Enter your new password below.
  NEW_PASSWORD_BUTTON: 'auth.ui.new_password_button', // Update password
  PASSWORD_UPDATED_SUCCESS: 'auth.success.password_updated', // Your password has been updated successfully!
  EMAIL_RESET_DESCRIPTION: 'auth.ui.email_reset_description', // We'll send a password reset link to this email address.
  REMEMBER_PASSWORD_CTA: 'auth.ui.remember_password_cta', // Remember your password?
} as const;
