import { z } from 'zod';

import { emailFieldForRegistration } from './user-fields';

export const resetSchema = z.object({
  email: emailFieldForRegistration,
});

export type ResetInput = z.infer<typeof resetSchema>;
