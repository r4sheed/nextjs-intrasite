import { internalServerError } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import { createTwoFactorConfirmation } from '@/features/auth/data/two-factor-confirmation';
import {
  deleteTwoFactorToken,
  getTwoFactorTokenById,
  incrementTwoFactorAttempts,
} from '@/features/auth/data/two-factor-token';
import { getUserById } from '@/features/auth/data/user';
import { TWO_FACTOR_MAX_ATTEMPTS } from '@/features/auth/lib/config';
import {
  twoFactorCodeExpired,
  twoFactorCodeInvalid,
  twoFactorMaxAttempts,
  twoFactorSessionMissing,
} from '@/features/auth/lib/errors';

export type VerifyTwoFactorData = {
  userId: string;
  email: string;
  verified: true;
};

/**
 * Service to verify two-factor authentication code.
 *
 * Validates the 6-digit code sent to the user's email and creates
 * a session upon successful verification.
 *
 * @param sessionId - The two-factor token identifier.
 * @param code - The 6-digit verification code.
 * @returns Response with verification status.
 */
export const verifyTwoFactorCode = async (
  sessionId: string,
  code: string
): Promise<Response<VerifyTwoFactorData>> => {
  try {
    // 1. Retrieve token associated with session
    const twoFactorToken = await getTwoFactorTokenById(sessionId);
    if (!twoFactorToken) {
      return response.failure(twoFactorSessionMissing());
    }

    // 2. Retrieve owning user
    const user = await getUserById(twoFactorToken.userId);
    if (!user) {
      await deleteTwoFactorToken(twoFactorToken.id);
      return response.failure(twoFactorSessionMissing());
    }

    // 3. Check expiry
    if (new Date() > twoFactorToken.expires) {
      await deleteTwoFactorToken(twoFactorToken.id);
      return response.failure(twoFactorCodeExpired());
    }

    // 4. Check max attempts
    if (twoFactorToken.attempts >= TWO_FACTOR_MAX_ATTEMPTS) {
      await deleteTwoFactorToken(twoFactorToken.id);
      return response.failure(twoFactorMaxAttempts());
    }

    // 5. Verify code
    if (twoFactorToken.token !== code) {
      await incrementTwoFactorAttempts(twoFactorToken.id);
      return response.failure(twoFactorCodeInvalid());
    }

    // 6. Code is valid - delete token and create confirmation
    await deleteTwoFactorToken(twoFactorToken.id);

    // Create a TwoFactorConfirmation record that will be checked
    // by the auth callback to allow session creation
    await createTwoFactorConfirmation(user.id);

    // Return success without message - client will handle sign-in and redirect
    return response.success({
      data: {
        userId: user.id,
        email: user.email,
        verified: true,
      },
    });
  } catch (error) {
    console.error('[SERVICE] Error verifying 2FA code:', error);
    return response.failure(internalServerError());
  }
};
