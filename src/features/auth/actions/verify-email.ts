'use server';

import { type Response, response } from '@/lib/response';

import { tokenNotFound } from '@/features/auth/lib/errors';
import { verifyEmail as verifyEmailService } from '@/features/auth/services';

import type { VerifyEmailData } from '@/features/auth/services/verify-email';

/**
 * Server Action to verify a user's email address using a verification token.
 *
 * This action performs basic token presence validation, then delegates the core
 * verification logic to the service layer which handles token lookup, expiration
 * checks, user email update, and token deletion in an atomic transaction.
 *
 * @param token - The verification token received from the client URL or email link.
 * @returns A Response object indicating success or failure with specific error details.
 */
export const verifyEmail = async (
  token: string
): Promise<Response<VerifyEmailData>> => {
  // Basic validation: ensure the token string is not empty or null/undefined
  if (!token) {
    return response.failure(tokenNotFound());
  }

  // Delegate the core business logic (lookup, update, delete transaction) to the service
  return await verifyEmailService(token);
};
