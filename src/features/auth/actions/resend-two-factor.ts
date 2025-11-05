'use server';

import { type Response, response } from '@/lib/response';

import { invalidFields } from '@/features/auth/lib/errors';
import {
  resendTwoFactorSchema,
  type ResendTwoFactorInput,
} from '@/features/auth/schemas/two-factor';
import {
  type ResendTwoFactorData,
  resendTwoFactorCode,
} from '@/features/auth/services/resend-two-factor';

/**
 * Server Action to resend two-factor authentication code.
 *
 * Validates the input (sessionId) and delegates to the service layer
 * to generate and send a new verification code.
 *
 * @param values - Resend input (sessionId).
 * @returns Response with resend status.
 */
export const resendTwoFactor = async (
  values: ResendTwoFactorInput
): Promise<Response<ResendTwoFactorData>> => {
  const result = resendTwoFactorSchema.safeParse(values);

  if (!result.success) {
    return response.failure(invalidFields(result.error.issues));
  }

  return await resendTwoFactorCode(result.data.sessionId);
};
