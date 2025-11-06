import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

export const verifyEmailSchema = z.object({
  token: z.uuid({ message: AUTH_ERRORS.tokenInvalid }),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
