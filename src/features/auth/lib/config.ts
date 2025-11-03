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
 * Redirect timeout in milliseconds after successful operations
 *
 * @remarks
 * Allows users to see success messages before being redirected.
 * Used in email verification and password reset flows.
 */
export const REDIRECT_TIMEOUT_MS = 2500;
