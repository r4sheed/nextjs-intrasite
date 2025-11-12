import { z } from 'zod';

import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@/features/auth/lib/config';
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
  .min(NAME_MIN_LENGTH, { message: AUTH_ERRORS.nameTooShort });

/**
 * Name field for user settings updates
 * Optional field with length constraints for profile updates
 */
export const nameFieldForSettings = z
  .string({ message: AUTH_ERRORS.invalidFields })
  .max(NAME_MAX_LENGTH, { message: AUTH_ERRORS.invalidFields })
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
  .min(PASSWORD_MIN_LENGTH, { message: AUTH_ERRORS.passwordTooShort });
