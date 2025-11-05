'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import {
  type VerifyTwoFactorInput,
  verifyTwoFactorSchema,
} from '@/features/auth/schemas/two-factor';
import {
  type VerifyTwoFactorData,
  verifyTwoFactorCode,
} from '@/features/auth/services/verify-two-factor';

/**
 * Server Action to verify two-factor authentication code.
 *
 * Validates the input (sessionId and 6-digit code) and delegates
 * to the service layer for verification.
 *
 * @param values - Verification input (sessionId and code).
 * @returns Response with verification status.
 */
export const verifyTwoFactor = async (
  values: VerifyTwoFactorInput
): Promise<Response<VerifyTwoFactorData>> => {
  const result = verifyTwoFactorSchema.safeParse(values);

  if (!result.success) {
    return response.failure(invalidFields(result.error.issues));
  }

  return await verifyTwoFactorCode(result.data.sessionId, result.data.code);
};
