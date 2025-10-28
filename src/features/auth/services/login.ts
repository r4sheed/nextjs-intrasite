import { AuthError } from 'next-auth';

import { type LoginData } from '@/features/auth/actions/login';
import { verifyUserCredentials } from '@/features/auth/data/user';
import { signIn } from '@/features/auth/lib/auth';
import {
  callbackError,
  emailVerificationRequired,
  invalidCredentials,
  invalidFields,
} from '@/features/auth/lib/errors';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { generateVerificationToken } from '@/features/auth/lib/tokens';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { siteFeatures } from '@/lib/config';
import { internalServerError } from '@/lib/errors';
import { sendVerificationEmail } from '@/lib/mail';
import { type Response, response } from '@/lib/result';

/**
 * Login service - handles user authentication
 * Returns Response<T> with user data on success, error response on error
 */
export async function loginUser(
  values: LoginInput
): Promise<Response<LoginData>> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return response.error(invalidFields(parsed.error.issues));
  }

  const { email, password } = parsed.data;

  try {
    // First validate credentials via the data layer. This avoids calling
    // `signIn` as the credential validator (which would re-run the `signIn`
    // callback and may prevent us from handling verification emails cleanly).
    const verifiedUser = await verifyUserCredentials(email, password);

    // Invalid credentials (either user not found or wrong password)
    if (!verifiedUser) {
      return response.error(invalidCredentials());
    }

    // If verification is enabled and the account is not verified, send a
    // verification email now (credentials are correct) and return the
    // appropriate UI message. We do NOT call `signIn` in this branch so we
    // don't attempt to create a session for an unverified account.
    if (siteFeatures.emailVerification && !verifiedUser.emailVerified) {
      const verificationToken = await generateVerificationToken(email);

      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );

      return response.success({
        data: { userId: verifiedUser.id },
        message: {
          key: AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SENT,
        },
      });
    }

    // At this point credentials are valid and the account is either verified
    // or verification is disabled. Proceed to call signIn to allow NextAuth
    // to create a session and run its callbacks (authorization, jwt, etc.).
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      // If signIn fails at this point, map to invalid credentials to avoid
      // leaking internal details.
      return response.error(invalidCredentials());
    }

    return response.success({ data: { userId: verifiedUser.id } });
  } catch (error) {
    if (error instanceof AuthError) {
      // https://authjs.dev/reference/core/errors
      switch (error.type) {
        case 'AccessDenied': // Thrown when the execution of the signIn callback fails or if it returns false.
          return response.error(emailVerificationRequired());
        case 'CredentialsSignin':
          return response.error(invalidCredentials());
        case 'CallbackRouteError':
          return response.error(callbackError());
      }
    }

    // TODO: Log the error for debugging
    console.error('Unexpected login error:', error);

    // Return generic error for unexpected errors
    return response.error(internalServerError());
  }
}
