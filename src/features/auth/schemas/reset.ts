import { z } from 'zod';

import { emailFieldForRegistration } from './user-fields';

/**
 * Schema for password reset requests
 * Validates email address for password reset functionality
 */
export const resetSchema = z.object({
  email: emailFieldForRegistration,
});

/**
 * Type for password reset form data
 */
export type ResetInput = z.infer<typeof resetSchema>;
