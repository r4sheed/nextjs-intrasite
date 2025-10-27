import { z } from 'zod';

import { AUTH_ERROR_MESSAGES } from '@/features/auth/lib/messages';

export const loginSchema = z.object({
  email: z.email({ message: AUTH_ERROR_MESSAGES.EMAIL_REQUIRED }),
  password: z
    .string({ message: AUTH_ERROR_MESSAGES.INVALID_FIELDS })
    .min(1, { message: AUTH_ERROR_MESSAGES.PASSWORD_REQUIRED }),
});

export type LoginInput = z.infer<typeof loginSchema>;
