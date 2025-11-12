import { z } from 'zod';

import {
  emailFieldForRegistration,
  nameFieldForRegistration,
  passwordField,
} from './user-fields';

export const registerSchema = z.object({
  name: nameFieldForRegistration,
  email: emailFieldForRegistration,
  password: passwordField,
});

export type RegisterInput = z.infer<typeof registerSchema>;
