import { internalServerError } from '@/lib/errors';
import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { getAccountByUserId } from '@/features/auth/data/account';
import { getUserById } from '@/features/auth/data/user';
import {
  invalidCredentials,
  passwordIncorrect,
  passwordUnchanged,
} from '@/features/auth/lib/errors';
import { User } from '@/features/auth/models';
import { type UserSettingsFormData } from '@/features/auth/schemas';

import type { Prisma } from '@prisma/client';

export type UpdateUserSettingsData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isOAuthAccount: boolean;
  twoFactorEnabled: boolean;
};

export type UpdateUserSettingsParams = {
  userId: string;
  values: UserSettingsFormData;
};

type UserProjection = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  twoFactorEnabled: boolean;
};

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  twoFactorEnabled: true,
} as const;

/**
 * Projects a user object to a simplified projection
 * @param user - The full user object from database
 * @returns Simplified user projection
 */
const projectUser = (user: {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  twoFactorEnabled: boolean;
}): UserProjection => ({
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  role: user.role,
  twoFactorEnabled: user.twoFactorEnabled,
});

/**
 * Builds success data for the update response
 * @param user - The projected user data
 * @param isOAuthAccount - Whether the user is an OAuth account
 * @returns Formatted success data
 */
const buildSuccessData = (
  user: UserProjection,
  isOAuthAccount: boolean
): UpdateUserSettingsData => ({
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  role: user.role,
  isOAuthAccount,
  twoFactorEnabled: user.twoFactorEnabled,
});

export const updateUserSettingsService = async ({
  userId,
  values,
}: UpdateUserSettingsParams): Promise<Response<UpdateUserSettingsData>> => {
  try {
    const dbUser = await getUserById(userId, { includePassword: true });

    if (!dbUser) {
      return response.failure(invalidCredentials());
    }

    const account = await getAccountByUserId(dbUser.id);
    const isOAuthAccount = Boolean(account);

    // If OAuth account, clear protected fields
    if (isOAuthAccount) {
      values.email = undefined;
      values.currentPassword = undefined;
      values.newPassword = undefined;
      values.confirmPassword = undefined;
    }

    const updatePayload: Prisma.UserUpdateInput = {};

    if (values.name !== undefined) {
      updatePayload.name = values.name;
    }

    if (values.email !== undefined) {
      updatePayload.email = values.email;
    }

    if (values.twoFactorEnabled !== undefined) {
      updatePayload.twoFactorEnabled = values.twoFactorEnabled;
    }

    const newPassword = values.newPassword?.trim() ?? '';

    if (newPassword.length > 0) {
      const currentPassword = values.currentPassword ?? '';
      const userModel = new User(dbUser);
      const isCurrentPasswordValid =
        await userModel.verifyPassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return response.failure(passwordIncorrect());
      }

      if (currentPassword === newPassword) {
        return response.failure(passwordUnchanged());
      }

      updatePayload.password = await User.hashPassword(newPassword);
    }

    if (Object.keys(updatePayload).length === 0) {
      return response.success({
        data: buildSuccessData(projectUser(dbUser), isOAuthAccount),
      });
    }

    const updatedUser = await db.user.update({
      where: { id: dbUser.id },
      data: updatePayload,
      select: USER_SELECT,
    });

    return response.success({
      data: buildSuccessData(updatedUser, isOAuthAccount),
    });
  } catch (error) {
    console.error('Failed to update user settings', error);
    return response.failure(internalServerError());
  }
};
