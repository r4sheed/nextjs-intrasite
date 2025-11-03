import { describe, expect, it } from 'vitest';

import { AppError } from '@/lib/errors';
import { CORE_CODES } from '@/lib/errors/codes';
import { HTTP_STATUS } from '@/lib/http-status';

import {
  internalServerError,
  validationFailed,
  unauthorized,
  forbidden,
  notFound,
  databaseError,
} from '../helpers';

describe('core error helpers', () => {
  it('internalServerError returns AppError with proper code and status', () => {
    const err = internalServerError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe(CORE_CODES.internalServerError);
    expect(err.httpStatus).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  it('validationFailed includes details and correct status', () => {
    const details = [{ field: 'email', message: 'required' }];
    const err = validationFailed(details);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe(CORE_CODES.validationFailed);
    expect(err.httpStatus).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
    expect(err.details).toEqual(details);
  });

  it('unauthorized and forbidden have correct status codes', () => {
    const a = unauthorized();
    const f = forbidden();
    expect(a.httpStatus).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(f.httpStatus).toBe(HTTP_STATUS.FORBIDDEN);
  });

  it('notFound includes resource details and params', () => {
    const err = notFound('User 42');
    expect(err.code).toBe(CORE_CODES.notFound);
    expect(err.httpStatus).toBe(HTTP_STATUS.NOT_FOUND);
    expect(err.details).toEqual({ resource: 'User 42' });
    expect(err.errorMessage).toBeDefined();
  });

  it('databaseError carries optional details', () => {
    const ctx = { query: 'SELECT 1' };
    const err = databaseError(ctx);
    expect(err.code).toBe(CORE_CODES.databaseError);
    expect(err.httpStatus).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(err.details).toBe(ctx);
  });
});
