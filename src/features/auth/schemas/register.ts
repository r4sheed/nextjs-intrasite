import { z } from 'zod';

import {
  emailFieldForRegistration,
  nameFieldForRegistration,
  passwordField,
} from './user-fields';

/**
 * Schema for user registration
 * Validates name, email, and password for new user accounts
 */
export const registerSchema = z.object({
  name: nameFieldForRegistration,
  email: emailFieldForRegistration,
  password: passwordField,
});

/**
 * Type for registration form data
 */
export type RegisterInput = z.infer<typeof registerSchema>;
