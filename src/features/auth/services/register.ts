import bcrypt from 'bcryptjs';

import { getUserByEmail } from '@/features/auth/data/user';
import { signIn } from '@/features/auth/lib/auth';
import {
  emailAlreadyExists,
  invalidFields,
  registrationFailed,
} from '@/features/auth/lib/errors';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { generateVerificationToken } from '@/features/auth/lib/tokens';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { siteFeatures } from '@/lib/config';
import { sendVerificationEmail } from '@/lib/mail';
import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/result';

/**
 * Register service - handles user registration and auto-login
 * Returns Response<T> with user data on success, error response on error
 */
export async function registerUser(
  values: RegisterInput
): Promise<Response<{ userId: string }>> {
  // Validate input
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return response.error(invalidFields(parsed.error.issues));
  }

  const { email, password, name } = parsed.data;

  // Check if user already exists
  const user = await getUserByEmail(email);
  if (user) {
    return response.error(emailAlreadyExists());
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  try {
    const createdUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    if (siteFeatures.emailVerification) {
      const verificationToken = await generateVerificationToken(email);

      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );

      return response.success({
        data: { userId: createdUser.id },
        message: {
          key: AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SENT,
          params: { email },
        },
      });
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

    return response.success({ data: { userId: createdUser.id } });
  } catch (error) {
    return response.error(registrationFailed());
  }
}
