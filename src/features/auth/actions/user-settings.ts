'use server';

import { unauthorized } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import { currentUser } from '@/features/auth/lib/auth-utils';
import { invalidFields } from '@/features/auth/lib/errors';
import {
  UserSettingsSchema,
  type UserSettingsInput,
} from '@/features/auth/schemas';
import {
  updateUserSettingsService,
  type UpdateUserSettingsData,
} from '@/features/auth/services/update-user-settings';

export const updateUserSettings = async (
  values: UserSettingsInput
): Promise<Response<UpdateUserSettingsData>> => {
  const result = UserSettingsSchema.safeParse(values);
  if (!result.success) {
    return response.failure(invalidFields(result.error.issues));
  }

  const user = await currentUser();
  if (!user) {
    return response.failure(unauthorized());
  }

  return updateUserSettingsService({
    userId: user.id,
    values: result.data,
  });
};
