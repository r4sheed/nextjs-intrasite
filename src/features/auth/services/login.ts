import { AuthError } from 'next-auth';

import { signIn } from '@/features/auth/lib/auth';
import { AuthErrorDefinitions as AuthErrors } from '@/features/auth/lib/errors';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { CoreErrors } from '@/lib/errors/definitions';
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
      switch (error.type) {
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
