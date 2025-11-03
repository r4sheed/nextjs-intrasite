import { siteFeatures } from '@/lib/config';
import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { type RegisterUserData } from '@/features/auth/actions';
import { getUserByEmail } from '@/features/auth/data/user';
import { signIn } from '@/features/auth/lib/auth';
import {
  emailAlreadyExists,
  invalidFields,
  registrationFailed,
} from '@/features/auth/lib/errors';
import { sendVerificationEmail } from '@/features/auth/lib/mail';
import { AUTH_SUCCESS } from '@/features/auth/lib/strings';
import { generateVerificationToken } from '@/features/auth/lib/tokens';
import { User } from '@/features/auth/models';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';

/**
 * Core service to register a new user account with email, password, and name.
 *
 * This service handles the complete user registration flow including duplicate
 * email validation, password hashing, database persistence, and optional email
 * verification. When email verification is disabled, it automatically signs in
 * the newly created user.
 *
 * @param values - Validated registration input containing email, password, and name.
 * @returns Response with user ID on success, or structured error on failure.
 *
 * @throws Never throws - all errors are returned as Response<T> error objects.
 */
export const registerUser = async (
  values: RegisterInput
): Promise<Response<RegisterUserData>> => {
  // Validate input
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return response.failure(invalidFields(parsed.error.issues));
  }

  const { email, password, name } = parsed.data;

  // Check if user already exists
  const user = await getUserByEmail(email);
  if (user) {
    return response.failure(emailAlreadyExists());
  }

  // Hash password using User model
  const hashedPassword = await User.hashPassword(password);

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
          key: AUTH_SUCCESS.verificationSent,
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
    return response.failure(registrationFailed(error));
  }
};
