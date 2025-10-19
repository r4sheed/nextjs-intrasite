import { AuthError } from 'next-auth';

import { AuthErrorDefinitions } from '@/features/auth/lib/errors';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { signIn } from '@/lib/auth';
import { BaseErrorDefinitions } from '@/lib/errors/definitions';

/**
 * Login service - handles user authentication
 * Throws AppError on failure, returns user data on success
 */
export async function loginUser(
  values: LoginInput
): Promise<{ userId: string }> {
  // Validate input
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    throw AuthErrorDefinitions.INVALID_FIELDS(parsed.error.issues);
  }

  const { email, password } = parsed.data;

  try {
    // Attempt sign in
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      throw AuthErrorDefinitions.INVALID_CREDENTIALS;
    }

    return { userId: email };
  } catch (error) {
    // Handle NextAuth errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          throw AuthErrorDefinitions.INVALID_CREDENTIALS;
        default:
          throw BaseErrorDefinitions.INTERNAL_SERVER_ERROR;
      }
    }

    // Re-throw AppError
    if (error instanceof Error && 'code' in error) {
      throw error;
    }

    // Throw generic error for unexpected errors
    throw BaseErrorDefinitions.INTERNAL_SERVER_ERROR;
  }
}
