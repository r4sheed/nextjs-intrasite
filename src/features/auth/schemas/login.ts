import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

export const loginSchema = z.object({
  email: z.email({ message: AUTH_ERRORS.emailRequired }),
  password: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.passwordRequired }),
  code: z.optional(z.string()),
});

export type LoginInput = z.infer<typeof loginSchema>;
