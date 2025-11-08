import { z } from 'zod';

import { AUTH_ERRORS } from '@/features/auth/lib/strings';
export const UserSettingsSchema = z.object({
  name: z.optional(z.string({ message: AUTH_ERRORS.invalidFields })),
});

export type UserSettingsInput = z.infer<typeof UserSettingsSchema>;
