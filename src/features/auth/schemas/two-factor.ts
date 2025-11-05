import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

export const verifyTwoFactorSchema = z.object({
  sessionId: z.string().cuid({ message: AUTH_ERRORS.invalidFields }),
  code: z
    .string({ message: AUTH_ERRORS.twoFactorCodeInvalid })
    .length(6, { message: AUTH_ERRORS.twoFactorCodeInvalid })
    .regex(/^\d+$/, { message: AUTH_ERRORS.twoFactorCodeInvalid }),
});

export type VerifyTwoFactorInput = z.infer<typeof verifyTwoFactorSchema>;

export const verifyTwoFactorCodeSchema = verifyTwoFactorSchema.pick({
  code: true,
});

export type VerifyTwoFactorCodeInput = z.infer<
  typeof verifyTwoFactorCodeSchema
>;

export const resendTwoFactorSchema = z.object({
  sessionId: z.string().cuid({ message: AUTH_ERRORS.invalidFields }),
});

export type ResendTwoFactorInput = z.infer<typeof resendTwoFactorSchema>;
