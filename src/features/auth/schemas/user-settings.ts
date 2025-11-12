import { z } from 'zod';

import { emailFieldForSettings, nameFieldForSettings } from './user-fields';

export const UserSettingsSchema = z
  .object({
    name: nameFieldForSettings,
    email: emailFieldForSettings,
  })
  .catchall(z.any().optional());

export type UserSettingsInput = z.infer<typeof UserSettingsSchema>;
