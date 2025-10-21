import { describe, expect, it } from 'vitest';

import { AppError } from '@/lib/errors/app-error';
import { HTTP_STATUS } from '@/lib/http-status';
import {
  Status,
  failure,
  getMessage,
  idle,
  isError,
  isIdle,
  isPartial,
  isPending,
  isSuccess,
  partial,
  pending,
  success,
} from '@/lib/response';

describe('Response Helpers', () => {
  describe('success', () => {
    it('should create a success response without message', () => {
      const data = { userId: '123' };
      const response = success(data);

      expect(response.status).toBe(Status.Success);
      expect(response.data).toEqual(data);
      expect(response.success).toBeUndefined();
    });

    it('should create a success response with string message', () => {
      const data = { userId: '123' };
      const message = 'Registration successful!';
      const response = success(data, message);

      expect(response.status).toBe(Status.Success);
      expect(response.data).toEqual(data);
      expect(response.success).toBe(message);
    });

    it('should create a success response with i18n message', () => {
      const data = { userId: '123' };
      const message = { key: 'auth.success.login', params: { name: 'John' } };
      const response = success(data, message);

      expect(response.status).toBe(Status.Success);
      expect(response.data).toEqual(data);
      expect(response.success).toEqual(message);
    });

    it('should create success with formatted i18n message', () => {
      const data = { userId: '123' };
      const message = {
        key: 'auth.success.verification_sent',
        params: { email: 'user@example.com' },
      };
      const response = success(data, message);

      expect(response.success).toEqual(message);
      expect(getMessage(response.success)).toBe(
        'auth.success.verification_sent'
      );
    });
  });

  describe('failure', () => {
    it('should create an error response with all fields directly on response', () => {
      const error = new AppError({
        code: 'TEST_ERROR',
        message: 'Test error message',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
      });

      const response = failure(error);

      expect(response.status).toBe(Status.Error);
      expect(response.error).toBe('Test error message');
      expect(response.code).toBe('TEST_ERROR');
      expect(response.httpStatus).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.details).toBeUndefined();
    });

    it('should handle i18n error messages', () => {
      const error = new AppError({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: { key: 'auth.errors.invalid_credentials' },
        httpStatus: HTTP_STATUS.UNAUTHORIZED,
      });

      const response = failure(error);

      expect(response.status).toBe(Status.Error);
      expect(response.error).toEqual({
        key: 'auth.errors.invalid_credentials',
      });
      expect(getMessage(response.error)).toBe(
        'auth.errors.invalid_credentials'
      );
    });

    it('should include error details', () => {
      const error = new AppError({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        details: { field: 'email', reason: 'invalid format' },
      });

      const response = failure(error);

      expect(response.details).toEqual({
        field: 'email',
        reason: 'invalid format',
      });
    });
  });

  describe('partial', () => {
    it('should create a partial response with errors', () => {
      const data = { deletedIds: ['1', '2'] };
      const errors = [
        {
          code: 'DELETE_FAILED',
          error: 'Failed to delete item 3',
          details: { id: '3' },
        },
      ];

      const response = partial(data, errors);

      expect(response.status).toBe(Status.Partial);
      expect(response.data).toEqual(data);
      expect(response.errors).toEqual(errors);
      expect(response.success).toBeUndefined();
    });

    it('should create a partial response with success message', () => {
      const data = { deletedIds: ['1', '2'] };
      const errors = [
        {
          code: 'DELETE_FAILED',
          error: { key: 'posts.error.delete_failed', params: { id: '3' } },
        },
      ];
      const message = {
        key: 'posts.partial.some_deleted',
        params: { count: 2 },
      };

      const response = partial(data, errors, message);

      expect(response.success).toEqual(message);
      expect(response.errors).toHaveLength(1);
    });
  });

  describe('pending', () => {
    it('should create a pending response', () => {
      const response = pending();

      expect(response.status).toBe(Status.Pending);
    });
  });

  describe('idle', () => {
    it('should create an idle response', () => {
      const response = idle();

      expect(response.status).toBe(Status.Idle);
    });
  });

  describe('Type Guards', () => {
    it('isIdle should identify idle responses', () => {
      const idleResponse = idle();
      const successResponse = success({ data: 'test' });

      expect(isIdle(idleResponse)).toBe(true);
      expect(isIdle(successResponse)).toBe(false);
    });

    it('isSuccess should identify success responses', () => {
      const successResponse = success({ data: 'test' });
      const errorResponse = failure(
        new AppError({
          code: 'TEST',
          message: 'test',
          httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })
      );

      expect(isSuccess(successResponse)).toBe(true);
      expect(isSuccess(errorResponse)).toBe(false);
    });

    it('isError should identify error responses', () => {
      const errorResponse = failure(
        new AppError({
          code: 'TEST',
          message: 'test',
          httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })
      );
      const successResponse = success({ data: 'test' });

      expect(isError(errorResponse)).toBe(true);
      expect(isError(successResponse)).toBe(false);
    });

    it('isPending should identify pending responses', () => {
      const pendingResponse = pending();
      const successResponse = success({ data: 'test' });

      expect(isPending(pendingResponse)).toBe(true);
      expect(isPending(successResponse)).toBe(false);
    });

    it('isPartial should identify partial responses', () => {
      const partialResponse = partial({ data: 'test' }, []);
      const successResponse = success({ data: 'test' });

      expect(isPartial(partialResponse)).toBe(true);
      expect(isPartial(successResponse)).toBe(false);
    });
  });

  describe('getMessage', () => {
    it('should extract string message', () => {
      expect(getMessage('Simple error')).toBe('Simple error');
    });

    it('should extract i18n key from message', () => {
      const msg = { key: 'auth.errors.invalid_credentials', params: {} };
      expect(getMessage(msg)).toBe('auth.errors.invalid_credentials');
    });

    it('should return undefined for undefined input', () => {
      expect(getMessage(undefined)).toBeUndefined();
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize and deserialize success response', () => {
      const original = success({ userId: '123' }, 'Success!');
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      expect(parsed.status).toBe(Status.Success);
      expect(parsed.data).toEqual({ userId: '123' });
      expect(parsed.success).toBe('Success!');
    });

    it('should serialize and deserialize error response', () => {
      const error = new AppError({
        code: 'TEST_ERROR',
        message: { key: 'test.error' },
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        details: { field: 'email' },
      });

      const original = failure(error);
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      expect(parsed.status).toBe(Status.Error);
      expect(parsed.code).toBe('TEST_ERROR');
      expect(parsed.error).toEqual({ key: 'test.error' });
      expect(parsed.httpStatus).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(parsed.details).toEqual({ field: 'email' });
    });

    it('should serialize and deserialize partial response', () => {
      const data = { deletedIds: ['1', '2'] };
      const errors = [
        {
          code: 'DELETE_FAILED',
          error: { key: 'error.delete_failed', params: { id: '3' } },
          details: { id: '3' },
        },
      ];

      const original = partial(data, errors, 'Partially completed');
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      expect(parsed.status).toBe(Status.Partial);
      expect(parsed.data).toEqual(data);
      expect(parsed.errors).toHaveLength(1);
      expect(parsed.errors[0].code).toBe('DELETE_FAILED');
      expect(parsed.success).toBe('Partially completed');
    });
  });

  describe('i18n Formatted Messages', () => {
    it('should support formatted success messages', () => {
      const email = 'user@example.com';
      const response = success(
        { userId: '123' },
        {
          key: 'auth.success.verification_sent',
          params: { email },
        }
      );

      expect(response.success).toEqual({
        key: 'auth.success.verification_sent',
        params: { email },
      });
    });

    it('should support formatted error messages', () => {
      const error = new AppError({
        code: 'AUTH_USER_NOT_FOUND',
        message: {
          key: 'auth.errors.user_not_found',
          params: { email: 'test@example.com' },
        },
        httpStatus: HTTP_STATUS.NOT_FOUND,
      });

      const response = failure(error);

      expect(response.error).toEqual({
        key: 'auth.errors.user_not_found',
        params: { email: 'test@example.com' },
      });
    });
  });
});
