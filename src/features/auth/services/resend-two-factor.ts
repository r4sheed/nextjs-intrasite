import { AppError, internalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { type Response, response } from '@/lib/response';

import { getTwoFactorTokenById } from '@/features/auth/data/two-factor-token';
import { getUserById } from '@/features/auth/data/user';
import { twoFactorSessionMissing } from '@/features/auth/lib/errors';
import { sendTwoFactorTokenEmail } from '@/features/auth/lib/mail';
import { AUTH_SUCCESS } from '@/features/auth/lib/strings';
import { generateTwoFactorToken } from '@/features/auth/lib/tokens';

export type ResendTwoFactorData = {
  codeSent: true;
  sessionId: string;
};

/**
 * Service to resend two-factor authentication code.
 *
 * Generates a new 6-digit code and sends it to the user's email.
 *
 * @param sessionId - The current two-factor session identifier.
 * @returns Response with resend status.
 */
export const resendTwoFactorCode = async (
  sessionId: string
): Promise<Response<ResendTwoFactorData>> => {
  try {
    const existingToken = await getTwoFactorTokenById(sessionId);
    if (!existingToken) {
      return response.failure(twoFactorSessionMissing());
    }

    const user = await getUserById(existingToken.userId);
    if (!user) {
      return response.failure(twoFactorSessionMissing());
    }

    const twoFactorToken = await generateTwoFactorToken(user.id);
    await sendTwoFactorTokenEmail({
      email: user.email,
      token: twoFactorToken.token,
      sessionId: twoFactorToken.id,
    });

    return response.success({
      data: { codeSent: true, sessionId: twoFactorToken.id },
      message: { key: AUTH_SUCCESS.twoFactorSent },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return response.failure(error);
    }

    logger.forAuth().error('Error resending 2FA code', {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return response.failure(internalServerError());
  }
};
