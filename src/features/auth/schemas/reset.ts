import { z } from 'zod';

import { AUTH_ERROR_MESSAGES } from '@/features/auth/lib/messages';

export const resetSchema = z.object({
  email: z.email({ message: AUTH_ERROR_MESSAGES.EMAIL_REQUIRED }),
});

export type ResetInput = z.infer<typeof resetSchema>;
