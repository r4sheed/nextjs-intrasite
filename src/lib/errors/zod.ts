import { z } from 'zod';

import { CORE_ERRORS } from '@/lib/errors/messages';
import { type Message } from '@/lib/response';

/**
 * Type guard to check if the error is a ZodError.
 * @param error - The error to check.
 * @returns True if the error is a ZodError.
 */
const isZodError = (error: unknown): error is z.ZodError => {
  return error instanceof z.ZodError;
};

/**
 * Extracts the primary message from a Zod validation error.
 *
 * It prioritizes the first issue's message. If no issues are found,
 * it falls back to a generic validation error message.
 *
 * @param error - The Zod error object.
 * @returns A `Message` object for use in `AppError`.
 */
export const getZodErrorMessage = (error: unknown): Message => {
  if (isZodError(error) && error.issues.length > 0) {
    const firstIssue = error.issues[0];
    if (firstIssue) {
      return { key: firstIssue.message };
    }
  }

  return { key: CORE_ERRORS.validationFailed };
};
