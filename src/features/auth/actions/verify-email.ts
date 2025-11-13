'use server';

import { validationFailed } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import {
  type VerifyEmailInput,
  verifyEmailSchema,
} from '@/features/auth/schemas';
import { verifyEmail as verifyEmailService } from '@/features/auth/services';

import type { VerifyEmailData } from '@/features/auth/services/verify-email';

/**
 * Server Action to verify a user's email address using a verification token.
 *
 * This action validates the email verification input using the defined Zod schema,
 * then delegates the core verification logic to the service layer which handles
 * token lookup, expiration checks, user email update, and token deletion in an
 * atomic transaction.
 *
 * @param values - The email verification data containing the email and token.
 * @returns A Response object indicating success or failure with specific error details.
 */
export const verifyEmail = async (
  values: VerifyEmailInput
): Promise<Response<VerifyEmailData>> => {
  const validation = verifyEmailSchema.safeParse(values);

  if (!validation.success) {
    // Return early with specific field validation errors
    return response.failure(validationFailed(validation.error));
  }

  // Delegate the core business logic (lookup, update, delete transaction) to the service
  return await verifyEmailService(validation.data);
};
