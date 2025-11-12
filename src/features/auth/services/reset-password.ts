import { AppError, internalServerError } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import { getUserByEmail } from '@/features/auth/data/user';
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
 * This service implements anti-enumeration protection by returning a generic success
 * message regardless of whether the user exists. This prevents attackers from determining
 * which email addresses are registered in the system. The reset email is only sent if
 * the user exists.
 *
 * @param values - Validated input containing the user's email address.
 * @returns Response with success message (even if user doesn't exist), or internal error.
 *
 * @throws Never throws - all errors are returned as Response<T> error objects.
 */
export const resetPassword = async (
  values: ResetInput
): Promise<Response<ResetPasswordData>> => {
  const { email } = values;

  // Retrieve the user from the database
  const user = await getUserByEmail(email);

  // TODO: Implement check for email verified status if applicable before proceeding

  // Security Principle (Anti-Enumeration):
  // If the user is not found, we still return a success message here to ensure
  // the UI displays a generic "email sent" message, preventing attackers from
  // distinguishing between existing and non-existing email addresses.
  if (!user) {
    return createSuccessResponse();
  }

  try {
    // Generate a new password reset token and persist it in the database
    const token = await generatePasswordResetToken(email);

    // Send the password reset email containing the generated token
    await sendResetPasswordEmail(token.email, token.token);

    return createSuccessResponse();
  } catch (error) {
    if (error instanceof AppError) {
      return response.failure(error);
    }

    // TODO: Log the error properly using a centralized logger
    console.error('Error during password reset:', error);

    // Return a generic internal server error for any unexpected issues during token generation or email sending
    return response.failure(internalServerError());
  }
};
