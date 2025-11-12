import { internalServerError } from '@/lib/errors';
import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { getAccountByUserId } from '@/features/auth/data/account';
import { getUserById } from '@/features/auth/data/user';
import { invalidCredentials } from '@/features/auth/lib/errors';
import { type UserSettingsInput } from '@/features/auth/schemas';

export type UpdateUserSettingsData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isOAuth: boolean;
};

export type UpdateUserSettingsParams = {
  userId: string;
  values: UserSettingsInput;
};

type UpdateContext = {
  isOAuth: boolean;
};

type FieldKey = keyof typeof FIELD_POLICIES;

type UpdatePayload = Partial<Record<FieldKey, string>>;

type UserProjection = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
};

const FIELD_POLICIES = {
  name: {
    allow: () => true,
  },
  email: {
    allow: (context: UpdateContext) => !context.isOAuth,
  },
} as const satisfies Record<
  string,
  { allow: (context: UpdateContext) => boolean }
>;

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
} as const;

const isManagedField = (key: string): key is FieldKey => key in FIELD_POLICIES;

const buildUpdatePayload = (
  values: UserSettingsInput,
  context: UpdateContext
): UpdatePayload => {
  return Object.entries(values).reduce<UpdatePayload>((acc, [key, value]) => {
    if (!isManagedField(key) || value === undefined) {
      return acc;
    }

    if (FIELD_POLICIES[key].allow(context)) {
      acc[key] = value;
    }

    return acc;
  }, {});
};

const projectUser = (user: {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}): UserProjection => ({
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  role: user.role,
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

    const updatePayload = buildUpdatePayload(values, context);

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
