import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

import { emailFieldForRegistration } from './user-fields';

export const loginSchema = z.object({
  email: emailFieldForRegistration,
  password: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.passwordRequired }),
  code: z.optional(z.string()),
  twoFactorBypass: z.optional(z.coerce.boolean()),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Form-specific type that only includes user-provided fields
export type LoginFormInput = Pick<LoginInput, 'email' | 'password'>;
