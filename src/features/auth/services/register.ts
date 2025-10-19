import bcrypt from 'bcryptjs';

import { getUserByEmail } from '@/features/auth/data/user';
import { AuthErrorDefinitions } from '@/features/auth/lib/errors';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { signIn } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Register service - handles user registration and auto-login
 * Throws AppError on failure, returns user data on success
 */
export async function registerUser(
  values: RegisterInput
): Promise<{ userId: string }> {
  // Validate input
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    throw AuthErrorDefinitions.INVALID_FIELDS(parsed.error.issues);
  }

  const { email, password, name } = parsed.data;

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw AuthErrorDefinitions.EMAIL_IN_USE;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  try {
    await prisma.user.create({
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

    return { userId: email };
  } catch (error) {
    throw AuthErrorDefinitions.REGISTRATION_FAILED;
  }
}
