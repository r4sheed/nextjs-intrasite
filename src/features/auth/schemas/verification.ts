import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

/**
 * Schema for email verification
 * Validates email and UUID token for email verification process
 */
export const verifyEmailSchema = z.object({
  email: z.string().email({ message: AUTH_ERRORS.emailInvalid }),
  token: z.uuid({ message: AUTH_ERRORS.tokenInvalid }),
});

/**
 * Type for email verification input
 */
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
