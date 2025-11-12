import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

/**
 * Common user field schemas for consistent validation across auth forms
 * Reusable field definitions to ensure validation consistency and easier maintenance
 */

/**
 * Name field for user registration
 * Requires minimum length and provides specific error messages
 */
export const nameFieldForRegistration = z
  .string({ message: AUTH_ERRORS.invalidFields })
  .min(1, { message: AUTH_ERRORS.nameRequired })
  .min(2, { message: AUTH_ERRORS.nameTooShort });

/**
 * Name field for user settings updates
 * Optional field with length constraints for profile updates
 */
export const nameFieldForSettings = z
  .string({ message: AUTH_ERRORS.invalidFields })
  .min(1, { message: AUTH_ERRORS.invalidFields })
  .max(50, { message: AUTH_ERRORS.invalidFields })
  .optional();

/**
 * Email field for user registration
 * Standard email validation with custom error message
 */
export const emailFieldForRegistration = z.email({
  message: AUTH_ERRORS.emailRequired,
});

/**
 * Email field for user settings updates
 * Optional email validation for profile updates
 */
export const emailFieldForSettings = z
  .email({ message: AUTH_ERRORS.invalidFields })
  .optional();

/**
 * Password field for registration and login
 * Requires minimum length with specific error messages
 */
export const passwordField = z
  .string({ message: AUTH_ERRORS.invalidFields })
  .min(1, { message: AUTH_ERRORS.passwordRequired })
  .min(8, { message: AUTH_ERRORS.passwordTooShort });
