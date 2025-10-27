import { z } from 'zod';

import { AUTH_ERROR_MESSAGES } from '@/features/auth/lib/messages';

export const registerSchema = z.object({
  email: z.email({ message: AUTH_ERROR_MESSAGES.EMAIL_REQUIRED }),
  password: z
    .string({ message: AUTH_ERROR_MESSAGES.INVALID_FIELDS })
    .min(1, { message: AUTH_ERROR_MESSAGES.PASSWORD_REQUIRED })
    .min(8, { message: AUTH_ERROR_MESSAGES.PASSWORD_TOO_SHORT }),
  name: z
    .string({ message: AUTH_ERROR_MESSAGES.INVALID_FIELDS })
    .min(1, { message: AUTH_ERROR_MESSAGES.NAME_REQUIRED })
    .min(2, { message: AUTH_ERROR_MESSAGES.NAME_TOO_SHORT }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
