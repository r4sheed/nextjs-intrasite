/**
 * Centralized auth configuration constants
 *
 * @remarks
 * These constants define critical security and UX parameters for the auth feature.
 * All auth-related code should import and use these values rather than hardcoding them.
 */

/**
 * Number of salt rounds for bcrypt password hashing
 *
 * @remarks
 * Higher values increase security but also increase computation time.
 * 10 rounds is a good balance for most applications (2^10 = 1024 iterations).
 */
export const BCRYPT_SALT_ROUNDS = 10;

/**
 * Token lifetime in milliseconds (60 minutes)
 *
 * @remarks
 * Used for both verification tokens and password reset tokens.
 * After this duration, tokens will expire and become invalid.
 */
export const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

/**
 * Two-factor authentication token lifetime in milliseconds (5 minutes)
 *
 * @remarks
 * Shorter lifetime for 2FA codes for enhanced security.
 * Users have 5 minutes to enter the code from their email.
 */
export const TWO_FACTOR_TOKEN_LIFETIME_MS = 5 * 60 * 1000;

/**
 * Minimum time that must elapse before a new 2FA token can be sent.
 *
 * @remarks
 * Used to enforce resend rate limiting. Aligns with TWO_FACTOR_TOKEN_LIFETIME_MS
 * by default so users cannot request multiple codes within the same validity window.
 */
export const TWO_FACTOR_RESEND_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Maximum number of resend requests allowed within the configured window.
 */
export const TWO_FACTOR_RESEND_MAX_PER_WINDOW = 3;

/**
 * Rolling window used to count resend requests (in milliseconds).
 */
export const TWO_FACTOR_RESEND_WINDOW_MS = 60 * 60 * 1000;

/**
 * Duration to retain historical two-factor tokens for rate-limit auditing.
 */
export const TWO_FACTOR_TOKEN_RETENTION_MS = 24 * 60 * 60 * 1000;

/**
 * Maximum allowed failed attempts for 2FA code verification
 *
 * @remarks
 * After this many failed attempts, the token is invalidated and
 * the user must request a new code.
 */
export const TWO_FACTOR_MAX_ATTEMPTS = 3;

/**
 * Redirect timeout in milliseconds after successful operations
 *
 * @remarks
 * Allows users to see success messages before being redirected.
 * Used in email verification and password reset flows.
 */
export const REDIRECT_TIMEOUT_MS = 2500;

/**
 * Placeholder password used when bypassing the credential check after 2FA confirmation.
 *
 * @remarks
 * NextAuth's credentials authorize schema expects a password field. When the
 * two-factor bypass flag is present we supply this placeholder value so schema
 * validation passes without requiring the user's actual password.
 */
export const TWO_FACTOR_BYPASS_PLACEHOLDER = '__two-factor-bypass__';

/**
 * Minimum length for user names
 *
 * @remarks
 * Used in registration and profile update forms.
 * Prevents extremely short names that could be problematic.
 */
export const NAME_MIN_LENGTH = 2;

/**
 * Maximum length for user names
 *
 * @remarks
 * Used in profile update forms to prevent excessively long names.
 * Provides reasonable upper bound for database storage.
 */
export const NAME_MAX_LENGTH = 50;

/**
 * Minimum length for passwords
 *
 * @remarks
 * Enforces basic password security requirements.
 * Should be combined with complexity requirements for production use.
 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Length of two-factor authentication codes
 *
 * @remarks
 * Standard 6-digit codes are widely used and provide good security balance.
 * Must match the format expected by the 2FA service.
 */
export const TWO_FACTOR_CODE_LENGTH = 6;
