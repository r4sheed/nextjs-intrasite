'use server';

import { z } from 'zod';

import { validationFailed } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

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
  const validation = resendTwoFactorSchema.safeParse(values);

  if (!validation.success) {
    return response.failure(validationFailed(z.treeifyError(validation.error)));
  }

  return await resendTwoFactorCode(validation.data.sessionId);
};
