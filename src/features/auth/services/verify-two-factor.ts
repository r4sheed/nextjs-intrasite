import { AuthError } from 'next-auth';

import { AppError, internalServerError } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import {
  createTwoFactorConfirmation,
  deleteTwoFactorConfirmation,
} from '@/features/auth/data/two-factor-confirmation';
import {
  deleteTwoFactorToken,
  getTwoFactorTokenById,
  incrementTwoFactorAttempts,
} from '@/features/auth/data/two-factor-token';
import { getUserById } from '@/features/auth/data/user';
import { signIn } from '@/features/auth/lib/auth';
import {
  TWO_FACTOR_BYPASS_PLACEHOLDER,
  TWO_FACTOR_MAX_ATTEMPTS,
} from '@/features/auth/lib/config';
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

    // Complete the sign-in process
    try {
      await signIn('credentials', {
        email: user.email,
        password: TWO_FACTOR_BYPASS_PLACEHOLDER,
        twoFactorBypass: true,
        redirect: false,
      });

      // Clean up the TwoFactorConfirmation after successful sign-in
      // This ensures cleanup happens regardless of callback execution
      await deleteTwoFactorConfirmation(user.id);
    } catch (error) {
      if (error instanceof AuthError) {
        // Handle NextAuth errors
        console.error(
          '[SERVICE] Sign-in failed after 2FA verification:',
          error
        );
        return response.failure(internalServerError());
      }
      throw error; // Re-throw unexpected errors
    }

    // Return success without message - client will handle redirect
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
