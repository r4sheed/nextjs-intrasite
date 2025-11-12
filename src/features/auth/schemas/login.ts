import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

import { emailFieldForRegistration } from './user-fields';

/**
 * Schema for user login
 * Validates email, password, and optional 2FA fields
 */
export const loginSchema = z.object({
  email: emailFieldForRegistration,
  password: z
    .string({ message: AUTH_ERRORS.invalidFields })
    .min(1, { message: AUTH_ERRORS.passwordRequired }),
  code: z.optional(z.string()),
  twoFactorBypass: z.optional(z.coerce.boolean()),
});

/**
 * Type for login form data including all fields
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Type for login form input excluding server-only fields
 * Used for client-side form validation
 */
export type LoginFormInput = Pick<LoginInput, 'email' | 'password'>;
