'use server';

import { z } from 'zod';

import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { getUserById } from '@/features/auth/data/user';
import { currentUser } from '@/features/auth/lib/auth-utils';
import { invalidCredentials } from '@/features/auth/lib/errors';
import { UserSettingsInput } from '@/features/auth/schemas';

export type UpdateUserSettingsData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
};

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

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...values,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  return response.success({
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      role: updatedUser.role,
    },
  });
};
