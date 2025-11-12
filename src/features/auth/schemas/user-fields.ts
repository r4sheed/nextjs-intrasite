import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

/**
 * Common user field schemas that can be reused across different forms
 * This ensures consistent validation rules and makes maintenance easier
 */

// Name field for registration (stricter validation)
export const nameFieldForRegistration = z
  .string({ message: AUTH_ERRORS.invalidFields })
  .min(1, { message: AUTH_ERRORS.nameRequired })
  .min(2, { message: AUTH_ERRORS.nameTooShort });

// Name field for user settings (allows updates, less strict)
export const nameFieldForSettings = z
  .string({ message: AUTH_ERRORS.invalidFields })
  .min(1, { message: AUTH_ERRORS.invalidFields })
  .max(50, { message: AUTH_ERRORS.invalidFields })
  .optional();

// Email field for registration
export const emailFieldForRegistration = z.email({
  message: AUTH_ERRORS.emailRequired,
});

// Email field for settings (optional for updates)
export const emailFieldForSettings = z
  .email({ message: AUTH_ERRORS.invalidFields })
  .optional();

// Password field for registration/login
export const passwordField = z
  .string({ message: AUTH_ERRORS.invalidFields })
  .min(1, { message: AUTH_ERRORS.passwordRequired })
  .min(8, { message: AUTH_ERRORS.passwordTooShort });
