import { beforeEach, describe, expect, it, vi } from 'vitest';

import { response as responseFactory, Status } from '@/lib/response';

import { AUTH_ERROR_CODES } from '@/features/auth/lib/codes';

import { resetPassword as resetPasswordAction } from '@/features/auth/actions';
import { resetPassword } from '@/features/auth/services';

// Mock the service layer
vi.mock('@/features/auth/services', () => ({
  resetPassword: vi.fn(),
}));

describe('resetPassword action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid email', async () => {
    const mockResponse = responseFactory.success({
      data: {},
      message: { key: 'auth.success.reset_email_sent' },
    });
    vi.mocked(resetPassword).mockResolvedValue(mockResponse);

    const response = await resetPasswordAction({
      email: 'test@example.com',
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.message?.key).toBe('auth.success.reset_email_sent');
    }
    expect(resetPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('should return error for invalid email format', async () => {
    const response = await resetPasswordAction({
      email: 'invalid-email',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_INVALID_FIELDS);
      expect(response.details).toBeDefined();
    }
    // Service should not be called for invalid input
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('should return error for empty email', async () => {
    const response = await resetPasswordAction({
      email: '',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_INVALID_FIELDS);
      expect(response.details).toBeDefined();
    }
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('should return error for missing email field', async () => {
    const response = await resetPasswordAction({} as any);

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_ERROR_CODES.AUTH_INVALID_FIELDS);
    }
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('should handle service errors properly', async () => {
    const mockError = {
      code: 'INTERNAL_SERVER_ERROR',
      message: { key: 'errors.internal_server_error' },
      httpStatus: 500,
    };
    const mockResponse = responseFactory.failure(mockError as any);
    vi.mocked(resetPassword).mockResolvedValue(mockResponse);

    const response = await resetPasswordAction({
      email: 'test@example.com',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('INTERNAL_SERVER_ERROR');
    }
  });

  it('should accept various valid email formats', async () => {
    const mockResponse = responseFactory.success({
      data: {},
      message: { key: 'auth.success.reset_email_sent' },
    });
    vi.mocked(resetPassword).mockResolvedValue(mockResponse);

    const validEmails = [
      'test@example.com',
      'user.name@example.co.uk',
      'user+tag@domain.com',
      'test_user@sub.domain.org',
    ];

    for (const email of validEmails) {
      const response = await resetPasswordAction({ email });
      expect(response.status).toBe(Status.Success);
    }

    expect(resetPassword).toHaveBeenCalledTimes(validEmails.length);
  });
});
