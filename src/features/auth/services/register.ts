import bcrypt from 'bcryptjs';

import { getUserByEmail } from '@/features/auth/data/user';
import { signIn } from '@/features/auth/lib/auth';
import { AuthErrorDefinitions as AuthError } from '@/features/auth/lib/errors';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { db } from '@/lib/prisma';
import { type Response, failure, success } from '@/lib/response';

/**
 * Register service - handles user registration and auto-login
 * Returns Response<T> with user data on success, error response on failure
 */
export async function registerUser(
  values: RegisterInput
): Promise<Response<{ userId: string }>> {
  // Validate input
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return failure(AuthError.INVALID_FIELDS(parsed.error.issues));
  }

  const { email, password, name } = parsed.data;

  // Check if user already exists
  const response = await getUserByEmail(email);
  if (response.status === 'error') {
    return response;
  }
  if (response.status === 'success' && response.data) {
    return failure(AuthError.EMAIL_IN_USE);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  try {
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Automatically sign in the user after registration
    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!signInResult || signInResult.error) {
      // User is created but not signed in, they can login manually
      // Don't throw error, just return success
    }

    return success({ userId: email });
  } catch (error) {
    return failure(AuthError.REGISTRATION_FAILED);
  }
}
