import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';

export const resetSchema = z.object({
  email: z.email({ message: AUTH_ERRORS.emailRequired }),
});

export type ResetInput = z.infer<typeof resetSchema>;
