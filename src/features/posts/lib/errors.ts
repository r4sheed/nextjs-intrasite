import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { POSTS_CODES, POSTS_ERRORS } from './strings';

/**
 * Posts error factory functions
 * Create structured AppError instances for common error scenarios
 *
 * @see .github/instructions/error-handling-guidelines.instructions.md
 */

/**
 * 404 - Posts not found
 */
export const postsNotFound = (id: string) =>
  new AppError({
    code: POSTS_CODES.notFound,
    message: { key: POSTS_ERRORS.notFound, params: { id } },
    httpStatus: HTTP_STATUS.NOT_FOUND,
  });

/**
 * 422 - Invalid input validation
 */
export const invalidInput = (details: unknown) =>
  new AppError({
    code: POSTS_CODES.invalidInput,
    message: { key: POSTS_ERRORS.invalidInput },
    httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    details,
  });

// Add more error factories as needed
