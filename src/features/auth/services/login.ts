import { AuthError } from 'next-auth';

import { getUserByEmail } from '@/features/auth/data/user';
import { signIn } from '@/features/auth/lib/auth';
import { AuthErrorDefinitions as AuthErrors } from '@/features/auth/lib/errors';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { generateVerificationToken } from '@/features/auth/lib/tokens';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { siteFeatures } from '@/lib/config';
import { CoreErrors } from '@/lib/errors/definitions';
import { sendVerificationEmail } from '@/lib/mail';
import { type Response, failure, success } from '@/lib/response';

/**
 * Login service - handles user authentication
 * Returns Response<T> with user data on success, error response on failure
 */
export async function loginUser(
  values: LoginInput
): Promise<Response<{ userId: string }>> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return failure(AuthErrors.INVALID_FIELDS(parsed.error.issues));
  }

  const { email, password } = parsed.data;

  try {
    if (siteFeatures.requireEmailVerification) {
      const user = await getUserByEmail(email);
      if (!user) {
        return failure(AuthErrors.INVALID_CREDENTIALS);
      }

      if (!user.emailVerified) {
        const verificationToken = await generateVerificationToken(user.email);

        await sendVerificationEmail(
          verificationToken.email,
          verificationToken.token
        );

        return success(
          { userId: email },
          AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SENT
        );
      }
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // Handle redirection manually to ensure proper response handling
    });

    if (!result || result.error) {
      return failure(AuthErrors.INVALID_CREDENTIALS);
    }

    return success({ userId: email });
  } catch (error) {
    if (error instanceof AuthError) {
      // https://authjs.dev/reference/core/errors
      switch (error.type) {
        case 'AccessDenied': // Thrown when the execution of the signIn callback fails or if it returns false.
          return failure(AuthErrors.EMAIL_VERIFICATION_REQUIRED);
        case 'CredentialsSignin':
          return failure(AuthErrors.INVALID_CREDENTIALS);
        case 'CallbackRouteError':
          return failure(AuthErrors.CALLBACK_ERROR);
      }
    }

    // TODO: Log the error for debugging
    console.error('Unexpected login error:', error);

    // Return generic error for unexpected errors
    return failure(CoreErrors.INTERNAL_SERVER_ERROR);
  }
}
