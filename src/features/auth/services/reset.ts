import { internalServerError } from '@/lib/errors/helpers';
import { type Response, response } from '@/lib/response';

import { getUserByEmail } from '@/features/auth/data/user';
import { userNotFound } from '@/features/auth/lib/errors';
import { sendResetPasswordEmail } from '@/features/auth/lib/mail';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { generatePasswordResetToken } from '@/features/auth/lib/tokens';

import { type ResetData } from '@/features/auth/actions';
import { ResetInput } from '@/features/auth/schemas';

/**
 * Core service function to handle the password reset process.
 * It checks for user existence, generates a reset token, and sends the reset email.
 *
 * NOTE: This function is designed to return a generic success message to the calling
 * action even if the user is not found, which is essential to prevent email enumeration attacks.
 *
 * @param values - The validated input containing the user's email address.
 * @returns A Response object indicating success (with a UI message key) or internal failure.
 */
export const resetPassword = async (
  values: ResetInput
): Promise<Response<ResetData>> => {
  const { email } = values;

  // Retrieve the user from the database.
  const user = await getUserByEmail(email);

  // TODO: Implement check for email verified status if applicable before proceeding.

  // Security Principle (Anti-Enumeration):
  // If the user is not found, we still return a success message here to ensure
  // the UI displays a generic "email sent" message, preventing attackers from
  // distinguishing between existing and non-existing email addresses.
  if (!user) {
    return response.success({
      message: { key: AUTH_UI_MESSAGES.RESET_EMAIL_SENT },
    });
  }

  try {
    // Generate a new password reset token and persist it in the database.
    const token = await generatePasswordResetToken(email);

    // Send the password reset email containing the generated token.
    await sendResetPasswordEmail(token.email, token.token);

    return response.success({
      message: { key: AUTH_UI_MESSAGES.RESET_EMAIL_SENT },
    });
  } catch (error) {
    // TODO: Log the error properly using a centralized logger
    console.error('Error during password reset:', error);

    // Return a generic internal server error for any unexpected issues during token generation or email sending.
    return response.failure(internalServerError());
  }
};
