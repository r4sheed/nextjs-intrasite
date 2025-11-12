import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

import {
  emailFieldForSettings,
  nameFieldForSettings,
  passwordField,
} from './user-fields';

/**
 * Current password field for password update operations
 * Optional field that becomes required when password update is attempted
 */
const currentPasswordField = z
  .string({ message: AUTH_ERRORS.passwordRequired })
  .min(1, { message: AUTH_ERRORS.passwordRequired })
  .optional();

/**
 * Confirm password field for password update operations
 * Must match newPassword when both are provided
 */
const confirmPasswordField = z
  .string({ message: AUTH_ERRORS.confirmPasswordRequired })
  .min(1, { message: AUTH_ERRORS.confirmPasswordRequired })
  .optional();

/**
 * Base schema for user settings with all possible fields
 * Uses catchall to allow additional fields for flexibility
 */
const baseSchema = z
  .object({
    name: nameFieldForSettings,
    email: emailFieldForSettings,
    currentPassword: currentPasswordField,
    newPassword: passwordField.optional(),
    confirmPassword: confirmPasswordField,
    twoFactorEnabled: z.boolean().optional(),
  })
  .catchall(z.any().optional());

/** Type inference for base schema */
type BaseSchema = z.infer<typeof baseSchema>;

/**
 * Type guard to check if a value is a non-empty string
 * Used for password validation logic
 */
const hasPasswordValue = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Security refinements for password update validation
 *
 * This function applies complex validation rules for password updates:
 * - Requires current password when any password field is provided
 * - Requires new password when password update is attempted
 * - Requires confirm password when password update is attempted
 * - Validates password confirmation matches
 * - Prevents setting new password same as current password
 *
 * @param data - The form data to validate
 * @param ctx - Zod refinement context for adding validation errors
 */
const applySecurityRefinements = <T extends Partial<BaseSchema>>(
  data: T,
  ctx: z.RefinementCtx
) => {
  // Check if user is attempting a password update
  const wantsPasswordUpdate =
    hasPasswordValue(data.currentPassword) ||
    hasPasswordValue(data.newPassword) ||
    hasPasswordValue(data.confirmPassword);

  // If no password update attempted, skip validation
  if (!wantsPasswordUpdate) {
    return;
  }

  // Validate required fields for password update
  if (!hasPasswordValue(data.currentPassword)) {
    ctx.addIssue({
      code: 'custom',
      message: AUTH_ERRORS.passwordRequired,
      path: ['currentPassword'],
    });
  }

  if (!hasPasswordValue(data.newPassword)) {
    ctx.addIssue({
      code: 'custom',
      message: AUTH_ERRORS.passwordRequired,
      path: ['newPassword'],
    });
  }

  if (!hasPasswordValue(data.confirmPassword)) {
    ctx.addIssue({
      code: 'custom',
      message: AUTH_ERRORS.confirmPasswordRequired,
      path: ['confirmPassword'],
    });
  }

  // Validate password confirmation
  if (
    hasPasswordValue(data.newPassword) &&
    hasPasswordValue(data.confirmPassword) &&
    data.newPassword !== data.confirmPassword
  ) {
    ctx.addIssue({
      code: 'custom',
      message: AUTH_ERRORS.confirmPasswordMismatch,
      path: ['confirmPassword'],
    });
  }

  // Prevent setting new password same as current
  if (
    hasPasswordValue(data.currentPassword) &&
    hasPasswordValue(data.newPassword) &&
    data.currentPassword.trim() === data.newPassword.trim()
  ) {
    ctx.addIssue({
      code: 'custom',
      message: AUTH_ERRORS.passwordUnchanged,
      path: ['newPassword'],
    });
  }
};

/**
 * Complete user settings schema
 *
 * Validates all user settings including profile information (name, email)
 * and security settings (password, 2FA). Uses security refinements for
 * password update validation.
 */
export const UserSettingsSchema = baseSchema.superRefine(
  applySecurityRefinements
);

/**
 * Type for complete user settings form data
 */
export type UserSettingsFormData = z.infer<typeof UserSettingsSchema>;

/**
 * Security settings schema
 *
 * Validates only security-related settings (password changes and 2FA toggle).
 * Used for forms that focus on security configuration without profile changes.
 */
export const SecuritySettingsSchema = z
  .object({
    currentPassword: currentPasswordField,
    newPassword: passwordField.optional(),
    confirmPassword: confirmPasswordField,
    twoFactorEnabled: z.boolean().optional(),
  })
  .superRefine(applySecurityRefinements);

/**
 * Type for security settings form data
 */
export type SecuritySettingsFormData = z.infer<typeof SecuritySettingsSchema>;

/**
 * Password-only schema for dedicated password update forms
 *
 * Requires all password fields and validates confirmation.
 * Used for UI forms that only handle password updates.
 */
export const PasswordSchema = z
  .object({
    currentPassword: z
      .string({ message: AUTH_ERRORS.passwordRequired })
      .min(1, { message: AUTH_ERRORS.passwordRequired }),
    newPassword: passwordField,
    confirmPassword: z
      .string({ message: AUTH_ERRORS.confirmPasswordRequired })
      .min(1, { message: AUTH_ERRORS.confirmPasswordRequired }),
  })
  .superRefine((data, ctx) => {
    // Validate password confirmation matches
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: AUTH_ERRORS.confirmPasswordMismatch,
        path: ['confirmPassword'],
      });
    }
  });

/**
 * Type for password-only form data
 */
export type PasswordFormData = z.infer<typeof PasswordSchema>;

/**
 * Two-factor authentication toggle schema
 *
 * Simple schema for enabling/disabling 2FA. Used for 2FA toggle forms.
 */
export const TwoFactorSchema = z.object({
  twoFactorEnabled: z.boolean(),
});

/**
 * Type for two-factor toggle form data
 */
export type TwoFactorFormData = z.infer<typeof TwoFactorSchema>;
