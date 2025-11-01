import { internalServerError } from '@/lib/errors/helpers';
import { type Response, response } from '@/lib/response';

import { type ResetData } from '@/features/auth/actions';
import { getUserByEmail } from '@/features/auth/data/user';
import { userNotFound } from '@/features/auth/lib/errors';
import { sendResetPasswordEmail } from '@/features/auth/lib/mail';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { generatePasswordResetToken } from '@/features/auth/lib/tokens';
import { ResetInput } from '@/features/auth/schemas';

export const resetPassword = async (
  values: ResetInput
): Promise<Response<ResetData>> => {
  const { email } = values;

  // TODO: Do not reveal whether the email exists for security reasons
  const user = await getUserByEmail(email);
  if (!user) {
    return response.failure(userNotFound(email));
  }

  // TODO: Check email verified status if applicable

  try {
    const token = await generatePasswordResetToken(email);

    await sendResetPasswordEmail(token.email, token.token);

    return response.success({
      message: { key: AUTH_UI_MESSAGES.RESET_EMAIL_SENT },
    });
  } catch (error) {
    // TODO: Log the error properly
    console.log('Error in resetPassword:', error);

    return response.failure(internalServerError());
  }
};
