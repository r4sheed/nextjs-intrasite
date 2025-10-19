'use server';

import { AuthErrorDefinitions } from '@/features/auth/lib/errors';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { registerUser } from '@/features/auth/services';
import { AppError, BaseErrorDefinitions } from '@/lib/errors';
import { type Response, failure, success } from '@/lib/response';

/**
 * Register action - validates input and calls service
 * Always returns Response<T>, never throws
 */
export async function register(
  values: RegisterInput
): Promise<Response<{ userId: string }>> {
  try {
    // Validate input
    const validation = registerSchema.safeParse(values);
    if (!validation.success) {
      const errorDetails = validation.error.issues;

      return failure({
        code: AuthErrorDefinitions.INVALID_FIELDS(errorDetails).code,
        message: AuthErrorDefinitions.INVALID_FIELDS(errorDetails).i18nMessage,
        details: errorDetails,
      });
    }

    // Call service layer
    const result = await registerUser(validation.data);

    return success(result);
  } catch (error) {
    // Handle AppError
    if (error instanceof AppError) {
      return failure({
        code: error.code,
        message: error.i18nMessage,
        details: error.details,
      });
    }

    // Return generic error for unexpected errors
    return failure({
      code: BaseErrorDefinitions.INTERNAL_SERVER_ERROR.code,
      message: BaseErrorDefinitions.INTERNAL_SERVER_ERROR.i18nMessage,
    });
  }
}
