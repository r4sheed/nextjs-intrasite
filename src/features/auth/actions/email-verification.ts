'use server';

import { getUserByEmailWithoutPassword } from '@/features/auth/data/user';
import { getVerificationTokenByToken } from '@/features/auth/data/vertification-token';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';
import { db } from '@/lib/prisma';
import { type Response, failure, success } from '@/lib/response';

export const emailVerification = async (
  token: string
): Promise<Response<{ email: string }>> => {
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return failure(tokenNotFound());
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return failure(tokenExpired());
  }

  const user = await getUserByEmailWithoutPassword(existingToken.email);
  if (!user) {
    return failure(userNotFound(existingToken.email));
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email, // This is important whenever an user changes email
    },
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return success({ email: existingToken.email });
};
