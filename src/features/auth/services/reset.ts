import { type ResetData } from '@/features/auth/actions';
import { getUserByEmail } from '@/features/auth/data/user';
import { userNotFound } from '@/features/auth/lib/errors';
import { ResetInput } from '@/features/auth/schemas';
import { type Response, response } from '@/lib/result';

export const resetPassword = async (
  values: ResetInput
): Promise<Response<ResetData>> => {
  const { email } = values;

  const user = await getUserByEmail(email);
  if (!user) {
    return response.error(userNotFound(email));
  }

  return response.success({ message: { key: '...' } });
};
