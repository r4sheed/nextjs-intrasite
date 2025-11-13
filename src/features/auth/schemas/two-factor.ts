import { z } from 'zod';

import { TWO_FACTOR_CODE_LENGTH } from '@/features/auth/lib/config';
import { AUTH_ERRORS } from '@/features/auth/lib/strings';

/**
 * Schema for verifying two-factor authentication
 * Validates session ID and 6-digit numeric code
 */
export const verifyTwoFactorSchema = z.object({
  sessionId: z.cuid({ message: AUTH_ERRORS.invalidFields }),
  code: z
    .string({ message: AUTH_ERRORS.twoFactorCodeInvalid })
    .length(TWO_FACTOR_CODE_LENGTH, {
      message: AUTH_ERRORS.twoFactorCodeInvalid,
    })
    .regex(/^\d+$/, { message: AUTH_ERRORS.twoFactorCodeInvalid }),
});

/**
 * Type for two-factor verification input
 */
export type VerifyTwoFactorInput = z.infer<typeof verifyTwoFactorSchema>;

/**
 * Schema for verifying only the 2FA code
 * Used when session ID is provided separately
 */
export const verifyTwoFactorCodeSchema = verifyTwoFactorSchema.pick({
  code: true,
});

/**
 * Type for two-factor code verification input
 */
export type VerifyTwoFactorCodeInput = z.infer<
  typeof verifyTwoFactorCodeSchema
>;

/**
 * Schema for resending two-factor codes
 * Validates session ID for code regeneration
 */
export const resendTwoFactorSchema = z.object({
  sessionId: z.cuid({ message: AUTH_ERRORS.invalidFields }),
});

/**
 * Type for resend two-factor input
 */
export type ResendTwoFactorInput = z.infer<typeof resendTwoFactorSchema>;
