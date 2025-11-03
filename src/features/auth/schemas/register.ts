import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

export const registerSchema = z.object({
  name: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.nameRequired })
    .min(2, { message: AUTH_ERRORS.nameTooShort }),
  email: z.email({ message: AUTH_ERRORS.emailRequired }),
  password: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.passwordRequired })
    .min(8, { message: AUTH_ERRORS.passwordTooShort }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
