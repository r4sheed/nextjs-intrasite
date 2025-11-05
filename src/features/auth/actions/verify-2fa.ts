'use server';

import { internalServerError } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import { getTwoFactorConfirmationByUserId } from '@/features/auth/data/two-factor-confirmation';
import { signIn } from '@/features/auth/lib/auth';
import { TWO_FACTOR_BYPASS_PLACEHOLDER } from '@/features/auth/lib/config';
import { invalidFields, userNotFound } from '@/features/auth/lib/errors';
import {
  type Verify2faInput,
  verify2faSchema,
} from '@/features/auth/schemas/two-factor';

export type Verify2faData = {
  success: true;
};

/**
 * Server action to complete 2FA sign-in after code verification.
 * This must be a server action because signIn() uses Prisma which can't run in browser.
 *
 * @param input - The user's email and ID.
 * @returns Response with success status
 */
export async function verify2fa(
  input: Verify2faInput
): Promise<Response<Verify2faData>> {
  // Validate input
  const validation = verify2faSchema.safeParse(input);
  if (!validation.success) {
    return response.failure(invalidFields(validation.error.issues));
  }

  const { email, userId } = validation.data;

  try {
    // Verify TwoFactorConfirmation exists before attempting sign-in
    const confirmation = await getTwoFactorConfirmationByUserId(userId);

    if (!confirmation) {
      return response.failure(userNotFound(email));
    }

    // Call signIn with bypass flag
    await signIn('credentials', {
      email,
      password: TWO_FACTOR_BYPASS_PLACEHOLDER,
      twoFactorBypass: true,
      redirect: false,
    });

    return response.success({
      data: { success: true },
    });
  } catch (error) {
    console.error('[VERIFY 2FA] Unexpected error:', error);
    return response.failure(internalServerError());
  }
}
