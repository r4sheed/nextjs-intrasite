'use server';

import { validationFailed, unauthorized } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import { currentUser } from '@/features/auth/lib/auth-utils';
import {
  UserSettingsSchema,
  type UserSettingsFormData,
} from '@/features/auth/schemas';
import {
  updateUserSettingsService,
  type UpdateUserSettingsData,
} from '@/features/auth/services/update-user-settings';

/**
 * Server Action to update the authenticated user's account settings.
 *
 * Validates the incoming settings payload, ensures the caller is authenticated,
 * then delegates the domain logic to the service layer which applies field-level
 * policies (for example blocking email changes for OAuth users) and persists the
 * updates. Returns a unified Response object describing success or failure.
 */
export const updateUserSettings = async (
  values: UserSettingsFormData
): Promise<Response<UpdateUserSettingsData>> => {
  const validation = UserSettingsSchema.safeParse(values);
  if (!validation.success) {
    return response.failure(validationFailed(validation.error));
  }

  const user = await currentUser();
  if (!user) {
    return response.failure(unauthorized());
  }

  return updateUserSettingsService({
    userId: user.id,
    values: validation.data,
  });
};
