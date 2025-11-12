import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

import {
  emailFieldForSettings,
  nameFieldForSettings,
  passwordField,
} from './user-fields';

const currentPasswordField = z
  .string({ message: AUTH_ERRORS.passwordRequired })
  .min(1, { message: AUTH_ERRORS.passwordRequired })
  .optional();

const confirmPasswordField = z
  .string({ message: AUTH_ERRORS.confirmPasswordRequired })
  .min(1, { message: AUTH_ERRORS.confirmPasswordRequired })
  .optional();

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

type BaseSchema = z.infer<typeof baseSchema>;

const hasPasswordValue = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const applySecurityRefinements = <T extends Partial<BaseSchema>>(
  data: T,
  ctx: z.RefinementCtx
) => {
  const wantsPasswordUpdate =
    hasPasswordValue(data.currentPassword) ||
    hasPasswordValue(data.newPassword) ||
    hasPasswordValue(data.confirmPassword);

  if (!wantsPasswordUpdate) {
    return;
  }

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

export const UserSettingsSchema = baseSchema.superRefine(
  applySecurityRefinements
);

export type UserSettingsFormData = z.infer<typeof UserSettingsSchema>;

export const SecuritySettingsSchema = z
  .object({
    currentPassword: currentPasswordField,
    newPassword: passwordField.optional(),
    confirmPassword: confirmPasswordField,
    twoFactorEnabled: z.boolean().optional(),
  })
  .superRefine(applySecurityRefinements);

export type SecuritySettingsFormData = z.infer<typeof SecuritySettingsSchema>;

// Password-only schema for UI forms that only handle password updates
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
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: AUTH_ERRORS.confirmPasswordMismatch,
        path: ['confirmPassword'],
      });
    }
  });

export type PasswordFormData = z.infer<typeof PasswordSchema>;

// Two-factor-only schema for toggling 2FA
export const TwoFactorSchema = z.object({
  twoFactorEnabled: z.boolean(),
});

export type TwoFactorFormData = z.infer<typeof TwoFactorSchema>;
