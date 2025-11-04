import { AuthError } from 'next-auth';

import { siteFeatures } from '@/lib/config';
import { internalServerError } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import { type LoginUserData } from '@/features/auth/actions';
import { verifyUserCredentials } from '@/features/auth/data/user';
import { signIn } from '@/features/auth/lib/auth';
import {
  callbackError,
  emailVerificationRequired,
  invalidCredentials,
  invalidFields,
} from '@/features/auth/lib/errors';
import { sendVerificationEmail } from '@/features/auth/lib/mail';
import {
  AUTH_CODES,
  AUTH_ERRORS,
  AUTH_SUCCESS,
} from '@/features/auth/lib/strings';
import { generateVerificationToken } from '@/features/auth/lib/tokens';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';

/**
 * Core service to authenticate a user with email and password credentials.
 *
 * This service validates credentials via the data layer, handles email verification
 * flows (sending verification emails for unverified accounts), and delegates session
 * creation to NextAuth's signIn function. It implements security best practices by
 * separating credential validation from session creation.
 *
 * @param values - Validated login input containing email and password.
 * @returns Response with user ID on success, or structured error on failure.
 *
 * @throws Never throws - all errors are returned as Response<T> error objects.
 */
export const loginUser = async (
  values: LoginInput
): Promise<Response<LoginUserData>> => {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return response.failure(invalidFields(parsed.error.issues));
  }

  const { email, password } = parsed.data;

  try {
    // First validate credentials via the data layer. This avoids calling
    // `signIn` as the credential validator (which would re-run the `signIn`
    // callback and may prevent us from handling verification emails cleanly).
    const verifiedUser = await verifyUserCredentials(email, password);

    // Invalid credentials (either user not found or wrong password)
    if (!verifiedUser) {
      return response.failure(invalidCredentials());
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

      // Return partial response indicating verification is required
      return response.partial({
        data: { userId: verifiedUser.id },
        errors: [
          {
            code: AUTH_CODES.verificationRequired,
            message: { key: AUTH_ERRORS.verificationRequired },
          },
        ],
        message: {
          key: AUTH_SUCCESS.verificationSent,
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
      return response.failure(invalidCredentials());
    }

    return response.success({ data: { userId: verifiedUser.id } });
  } catch (error) {
    if (error instanceof AuthError) {
      // https://authjs.dev/reference/core/errors
      switch (error.type) {
        case 'AccessDenied': // Thrown when the execution of the signIn callback fails or if it returns false.
          return response.failure(emailVerificationRequired());
        case 'CredentialsSignin':
          return response.failure(invalidCredentials());
        case 'CallbackRouteError':
          return response.failure(callbackError(error));
      }
    }

    // TODO: Log the error for debugging
    console.error('Unexpected login error:', error);

    // Return generic error for unexpected errors
    return response.failure(internalServerError());
  }
};
