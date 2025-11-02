import { describe, expect, it } from 'vitest';

import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';
import {
  getMessage,
  isFailure,
  isPartial,
  isSuccess,
  response,
  Status,
} from '@/lib/response';

describe('Response Helpers', () => {
  describe('success', () => {
    it('should create a success response without message', () => {
      const data = { userId: '123' };
      const result = response.success({
        data: data,
      });

      expect(result.status).toBe(Status.Success);
      expect(result.data).toEqual(data);
      expect(result.message).toBeUndefined();
    });

    it('should create a success response with string message', () => {
      const data = { userId: '123' };
      const message = 'Registration successful!';
      const result = response.success({
        data: data,
        message: {
          key: message,
        },
      });

      expect(result.status).toBe(Status.Success);
      expect(result.data).toEqual(data);
      expect(result.message?.key).toBe(message);
    });

    it('should create a success response with i18n message', () => {
      const data = { userId: '123' };
      const message = { key: 'auth.success.login', params: { name: 'John' } };
      const result = response.success({
        data: data,
        message: message,
      });

      expect(result.status).toBe(Status.Success);
      expect(result.data).toEqual(data);
      expect(result.message).toEqual(message);
    });

    it('should create success with formatted i18n message', () => {
      const data = { userId: '123' };
      const message = {
        key: 'auth.success.verification_sent',
        params: { email: 'user@example.com' },
      };
      const result = response.success({
        data: data,
        message: message,
      });

      expect(result.message).toEqual(message);
      expect(getMessage(result.message)).toBe('auth.success.verification_sent');
    });
  });

  describe('error', () => {
    it('should create an error response with all fields directly on response', () => {
      const data = new AppError({
        code: 'TEST_ERROR',
        message: { key: 'Test error message' },
        httpStatus: HTTP_STATUS.BAD_REQUEST,
      });

      const result = response.failure(data);

      expect(result.status).toBe(Status.Error);
      expect(result.message?.key).toBe('Test error message');
      expect(result.code).toBe('TEST_ERROR');
      expect(result.httpStatus).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(result.details).toBeUndefined();
    });

    it('should handle i18n error messages', () => {
      const data = new AppError({
        code: 'invalidCredentials',
        message: { key: 'auth.errors.invalidCredentials' },
        httpStatus: HTTP_STATUS.UNAUTHORIZED,
      });

      const result = response.failure(data);

      expect(result.status).toBe(Status.Error);
      expect(result.message).toEqual({
        key: 'auth.errors.invalidCredentials',
      });
      expect(getMessage(result.message)).toBe('auth.errors.invalidCredentials');
    });

    it('should include error details', () => {
      const data = new AppError({
        code: 'VALIDATION_ERROR',
        message: { key: 'Validation failed' },
        httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        details: { field: 'email', reason: 'invalid format' },
      });

      const result = response.failure(data);

      expect(result.details).toEqual({
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
          message: {
            key: 'Failed to delete item 3',
          },
          details: { id: '3' },
        },
      ];

      const result = response.partial({
        data: data,
        errors: errors,
      });

      expect(result.status).toBe(Status.Partial);
      expect(result.data).toEqual(data);
      expect(result.errors).toEqual(errors);
      expect(result.message).toBeUndefined();
    });

    it('should create a partial response with success message', () => {
      const data = { deletedIds: ['1', '2'] };
      const errors = [
        {
          code: 'DELETE_FAILED',
          message: { key: 'posts.error.delete_failed', params: { id: '3' } },
        },
      ];
      const message = {
        key: 'posts.partial.some_deleted',
        params: { count: 2 },
      };

      const result = response.partial({
        data: data,
        errors: errors,
        message: message,
      });

      expect(result.message).toEqual(message);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Type Guards', () => {
    it('isSuccess should identify success responses', () => {
      const successResponse = response.success({ data: 'test' });
      const errorResponse = response.failure(
        new AppError({
          code: 'TEST',
          message: {
            key: 'test',
          },
          httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })
      );

      expect(isSuccess(successResponse)).toBe(true);
      expect(isSuccess(errorResponse)).toBe(false);
    });

    it('isFailure should identify error responses', () => {
      const errorResponse = response.failure(
        new AppError({
          code: 'TEST',
          message: {
            key: 'test',
          },
          httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })
      );
      const successResponse = response.success({ data: 'test' });

      expect(isFailure(errorResponse)).toBe(true);
      expect(isFailure(successResponse)).toBe(false);
    });

    it('isPartial should identify partial responses', () => {
      const partialResponse = response.partial({
        data: { data: 'test' },
        errors: [],
      });
      const successResponse = response.success({ data: 'test' });

      expect(isPartial(partialResponse)).toBe(true);
      expect(isPartial(successResponse)).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize and deserialize success response', () => {
      const original = response.success({
        data: { userId: '123' },
        message: { key: 'Success!' },
      });
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      expect(parsed.status).toBe(Status.Success);
      expect(parsed.data).toEqual({ userId: '123' });
      expect(parsed.message.key).toBe('Success!');
    });

    it('should serialize and deserialize error response', () => {
      const data = new AppError({
        code: 'TEST_ERROR',
        message: { key: 'test.error' },
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        details: { field: 'email' },
      });

      const original = response.failure(data);
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      expect(parsed.status).toBe(Status.Error);
      expect(parsed.code).toBe('TEST_ERROR');
      expect(parsed.message).toEqual({ key: 'test.error' });
      expect(parsed.httpStatus).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(parsed.details).toEqual({ field: 'email' });
    });

    it('should serialize and deserialize partial response', () => {
      const data = { deletedIds: ['1', '2'] };
      const errors = [
        {
          code: 'DELETE_FAILED',
          message: { key: 'error.delete_failed', params: { id: '3' } },
          details: { id: '3' },
        },
      ];

      const original = response.partial({
        data: data,
        errors: errors,
        message: {
          key: 'Partially completed',
        },
      });
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      expect(parsed.status).toBe(Status.Partial);
      expect(parsed.data).toEqual(data);
      expect(parsed.errors).toHaveLength(1);
      expect(parsed.errors[0].code).toBe('DELETE_FAILED');
      expect(parsed.message.key).toBe('Partially completed');
    });
  });

  describe('i18n Formatted Messages', () => {
    it('should support formatted success messages', () => {
      const email = 'user@example.com';
      const formattedSuccess = response.success({
        data: { userId: '123' },
        message: {
          key: 'auth.success.verification_sent',
          params: { email },
        },
      });

      expect(formattedSuccess.message).toEqual({
        key: 'auth.success.verification_sent',
        params: { email },
      });
    });

    it('should support formatted error messages', () => {
      const data = new AppError({
        code: 'userNotFound',
        message: {
          key: 'auth.errors.userNotFound',
          params: { email: 'test@example.com' },
        },
        httpStatus: HTTP_STATUS.NOT_FOUND,
      });

      const formattedError = response.failure(data);

      expect(formattedError.message).toEqual({
        key: 'auth.errors.userNotFound',
        params: { email: 'test@example.com' },
      });
    });
  });
});
