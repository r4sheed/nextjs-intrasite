import { siteFeatures } from '@/lib/config';
import { AppError, internalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { type Response, response } from '@/lib/response';

import { getUserByEmail } from '@/features/auth/data/user';
import {
  emailVerificationRequiredForPasswordReset,
  userNotFound,
} from '@/features/auth/lib/errors';
import { sendResetPasswordEmail } from '@/features/auth/lib/mail';
import { AUTH_SUCCESS } from '@/features/auth/lib/strings';
import { generatePasswordResetToken } from '@/features/auth/lib/tokens';
import { type ResetInput } from '@/features/auth/schemas';

export type ResetPasswordData = Record<string, never>;

const createSuccessResponse = () =>
  response.success<ResetPasswordData>({
    message: { key: AUTH_SUCCESS.passwordResetSent },
  });

/**
 * Core service to initiate a password reset request by generating a token and sending an email.
 *
 * This service implements partial anti-enumeration protection:
 * - Returns error if user doesn't exist (reveals non-existence)
 * - Returns error if user exists but email is not verified (reveals verification status)
 * - Only sends password reset email if user exists AND email is verified
 *
 * @param values - Validated input containing the user's email address.
 * @returns Response with success message, or error if user doesn't exist or email not verified.
 *
 * @throws Never throws - all errors are returned as Response<T> error objects.
 */
export const resetPassword = async (
  values: ResetInput
): Promise<Response<ResetPasswordData>> => {
  try {
    const { email } = values;
    const user = await getUserByEmail(email);

    // Anti-enumeration: return error if user not found (don't reveal if email exists)
    if (!user) {
      return response.failure(userNotFound(email));
    }

    // If email verification required and user not verified, return specific error
    if (siteFeatures.emailVerification && !user.emailVerified) {
      return response.failure(emailVerificationRequiredForPasswordReset());
    }

    // User exists and is verified, send password reset email
    const token = await generatePasswordResetToken(user.email);
    await sendResetPasswordEmail(token.email, token.token);

    return createSuccessResponse();
  } catch (error) {
    if (error instanceof AppError) {
      return response.failure(error);
    }
    logger.error('Unexpected error during password reset', {
      error,
      email: values.email,
    });
    return response.failure(internalServerError());
  }
};
