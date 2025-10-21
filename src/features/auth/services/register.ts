import bcrypt from 'bcryptjs';

import { getUserByEmail } from '@/features/auth/data/user';
import { signIn } from '@/features/auth/lib/auth';
import { AuthErrorDefinitions as AuthError } from '@/features/auth/lib/errors';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { generateVerificationToken } from '@/features/auth/lib/tokens';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { siteFeatures } from '@/lib/config';
import { sendVerificationEmail } from '@/lib/mail';
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
  const user = await getUserByEmail(email);
  if (user) {
    return failure(AuthError.EMAIL_ALREADY_EXISTS);
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

    if (siteFeatures.requireEmailVerification) {
      const verificationToken = await generateVerificationToken(email);

      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );

      return success(
        { userId: email },
        { key: AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SENT, params: { email } }
      );
    } else {
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
    }

    return success({ userId: email });
  } catch (error) {
    return failure(AuthError.REGISTRATION_FAILED);
  }
}
