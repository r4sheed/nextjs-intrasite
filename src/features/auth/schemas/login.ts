import { z } from 'zod';

import { AUTH_ERROR_MESSAGES } from '@/features/auth/lib/messages';

export const loginSchema = z.object({
  email: z.email({
    message: AUTH_ERROR_MESSAGES.INVALID_FIELDS,
  }),
  password: z.string().min(1, { message: AUTH_ERROR_MESSAGES.INVALID_FIELDS }),
});

export type LoginInput = z.infer<typeof loginSchema>;
