import { beforeEach, describe, expect, it, vi } from 'vitest';

import { response as responseFactory, Status } from '@/lib/response';

import { AUTH_ERROR_CODES } from '@/features/auth/lib/codes';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';

import { updatePassword as updatePasswordAction } from '@/features/auth/actions';
import { updatePassword } from '@/features/auth/services';

// Mock the service layer
vi.mock('@/features/auth/services', () => ({
  updatePassword: vi.fn(),
}));

describe('updatePassword action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid token and password', async () => {
    const mockResponse = responseFactory.success({
      data: {},
      message: { key: 'auth.success.password_updated' },
    });
    vi.mocked(updatePassword).mockResolvedValue(mockResponse);

    const response = await updatePasswordAction({
      token: 'valid-token-123',
      password: 'NewPassword123!',
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.message?.key).toBe('auth.success.password_updated');
    }
    expect(updatePassword).toHaveBeenCalledWith({
      token: 'valid-token-123',
      password: 'NewPassword123!',
    });
  });

  it('should return error for invalid password (too short)', async () => {
    const response = await updatePasswordAction({
      token: 'valid-token-123',
      password: 'short',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_INVALID_FIELDS);
      expect(response.details).toBeDefined();
    }
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('should return error for empty password', async () => {
    const response = await updatePasswordAction({
      token: 'valid-token-123',
      password: '',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_INVALID_FIELDS);
    }
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('should return error for missing token', async () => {
    const response = await updatePasswordAction({
      token: '',
      password: 'NewPassword123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_INVALID_FIELDS);
    }
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('should return error for non-existent token', async () => {
    const mockResponse = responseFactory.failure(tokenNotFound());
    vi.mocked(updatePassword).mockResolvedValue(mockResponse);

    const response = await updatePasswordAction({
      token: 'invalid-token',
      password: 'NewPassword123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_TOKEN_NOT_FOUND);
    }
  });

  it('should return error for expired token', async () => {
    const mockResponse = responseFactory.failure(tokenExpired('expired-token'));
    vi.mocked(updatePassword).mockResolvedValue(mockResponse);

    const response = await updatePasswordAction({
      token: 'expired-token',
      password: 'NewPassword123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_TOKEN_EXPIRED);
    }
  });

  it('should return error when user not found', async () => {
    const mockResponse = responseFactory.failure(
      userNotFound('test@example.com')
    );
    vi.mocked(updatePassword).mockResolvedValue(mockResponse);

    const response = await updatePasswordAction({
      token: 'valid-token-123',
      password: 'NewPassword123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_USER_NOT_FOUND);
    }
  });

  it('should accept various valid password formats', async () => {
    const mockResponse = responseFactory.success({
      data: {},
      message: { key: 'auth.success.password_updated' },
    });
    vi.mocked(updatePassword).mockResolvedValue(mockResponse);

    const validPasswords = [
      'Password123!',
      'MySecureP@ssw0rd',
      'Test1234',
      'ComplexP@ss123',
    ];

    for (const password of validPasswords) {
      const response = await updatePasswordAction({
        token: 'valid-token',
        password,
      });
      expect(response.status).toBe(Status.Success);
    }

    expect(updatePassword).toHaveBeenCalledTimes(validPasswords.length);
  });

  it('should validate both token and password fields', async () => {
    const response = await updatePasswordAction({
      token: '',
      password: '',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_INVALID_FIELDS);
      // Should have validation errors for both fields
      expect(response.details).toBeDefined();
    }
    expect(updatePassword).not.toHaveBeenCalled();
  });
});
