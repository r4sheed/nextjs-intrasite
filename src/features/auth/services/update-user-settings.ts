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
  isOAuth: boolean;
  twoFactorEnabled: boolean;
};

export type UpdateUserSettingsParams = {
  userId: string;
  values: UserSettingsFormData;
};

type UpdateContext = {
  isOAuth: boolean;
};

type ExtendedUserSettingsInput = UserSettingsFormData & {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  twoFactorEnabled?: boolean;
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

const buildSuccessData = (
  user: UserProjection,
  context: UpdateContext
): UpdateUserSettingsData => ({
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  role: user.role,
  isOAuth: context.isOAuth,
  twoFactorEnabled: user.twoFactorEnabled,
});

export const updateUserSettingsService = async ({
  userId,
  values,
}: UpdateUserSettingsParams): Promise<Response<UpdateUserSettingsData>> => {
  try {
    const dbUser = await getUserById(userId);

    if (!dbUser) {
      return response.failure(invalidCredentials());
    }

    const account = await getAccountByUserId(dbUser.id);
    const context: UpdateContext = { isOAuth: Boolean(account) };

    const extendedValues = values as ExtendedUserSettingsInput;

    const updatePayload: Prisma.UserUpdateInput = {};

    if (values.name !== undefined && values.name !== dbUser.name) {
      updatePayload.name = values.name;
    }

    if (
      !context.isOAuth &&
      values.email !== undefined &&
      values.email !== dbUser.email
    ) {
      updatePayload.email = values.email;
    }

    if (
      typeof extendedValues.twoFactorEnabled === 'boolean' &&
      extendedValues.twoFactorEnabled !== dbUser.twoFactorEnabled
    ) {
      updatePayload.twoFactorEnabled = extendedValues.twoFactorEnabled;
    }

    const newPassword =
      typeof extendedValues.newPassword === 'string'
        ? extendedValues.newPassword.trim()
        : '';

    if (newPassword.length > 0) {
      const currentPassword = extendedValues.currentPassword ?? '';
      const userModel = new User(dbUser);
      const isCurrentPasswordValid =
        await userModel.verifyPassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return response.failure(passwordIncorrect());
      }

      if (currentPassword.length > 0 && currentPassword === newPassword) {
        return response.failure(passwordUnchanged());
      }

      updatePayload.password = await User.hashPassword(newPassword);
    }

    if (Object.keys(updatePayload).length === 0) {
      return response.success({
        data: buildSuccessData(projectUser(dbUser), context),
      });
    }

    const updatedUser = await db.user.update({
      where: { id: dbUser.id },
      data: updatePayload,
      select: USER_SELECT,
    });

    return response.success({
      data: buildSuccessData(updatedUser, context),
    });
  } catch (error) {
    console.error('Failed to update user settings', error);
    return response.failure(internalServerError());
  }
};
