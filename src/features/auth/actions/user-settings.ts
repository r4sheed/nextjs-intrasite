'use server';

import { z } from 'zod';

import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { getUserById } from '@/features/auth/data';
import { currentUser } from '@/features/auth/lib/auth-utils';
import { invalidCredentials } from '@/features/auth/lib/errors';
import { UserSettingsInput } from '@/features/auth/schemas';

export type UpdateUserSettingsData = null;

export const updateUserSettings = async (
  values: UserSettingsInput
): Promise<Response<UpdateUserSettingsData>> => {
  const user = await currentUser();

  if (!user) {
    return response.failure(invalidCredentials()); // TODO: Add not authenticated error
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return response.failure(invalidCredentials());
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...values,
    },
  });

  return response.success({}); // TODO: Return success message
};
