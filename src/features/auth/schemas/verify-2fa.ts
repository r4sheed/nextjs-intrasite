import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

/**
 * Schema for validating the verify2fa server action input.
 */
export const verify2faSchema = z.object({
  email: z.string().email({ message: AUTH_ERRORS.emailInvalid }),
  userId: z.string().cuid({ message: AUTH_ERRORS.invalidFields }),
});

export type Verify2faInput = z.infer<typeof verify2faSchema>;
