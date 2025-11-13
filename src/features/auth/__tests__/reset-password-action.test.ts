import { beforeEach, describe, expect, it, vi } from 'vitest';

import { internalServerError } from '@/lib/errors';
import { CORE_CODES } from '@/lib/errors/codes';
import { response as responseFactory, Status } from '@/lib/response';

import { resetPassword as resetPasswordAction } from '@/features/auth/actions';
import { AUTH_SUCCESS } from '@/features/auth/lib/strings';
import { resetPassword } from '@/features/auth/services';

import type { ResetInput } from '@/features/auth/schemas';

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
      message: { key: AUTH_SUCCESS.passwordResetSent },
    });
    vi.mocked(resetPassword).mockResolvedValue(mockResponse);

    const response = await resetPasswordAction({
      email: 'test@example.com',
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.message?.key).toBe(AUTH_SUCCESS.passwordResetSent);
    }
    expect(resetPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('should return error for invalid email format', async () => {
    const response = await resetPasswordAction({
      email: 'invalid-email',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(CORE_CODES.validationFailed);
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
      expect(response.code).toBe(CORE_CODES.validationFailed);
      expect(response.details).toBeDefined();
    }
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('should return error for missing email field', async () => {
    const response = await resetPasswordAction({} as ResetInput);

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(CORE_CODES.validationFailed);
    }
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('should handle service errors properly', async () => {
    const mockResponse = responseFactory.failure(internalServerError());
    vi.mocked(resetPassword).mockResolvedValue(mockResponse);

    const response = await resetPasswordAction({
      email: 'test@example.com',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(CORE_CODES.internalServerError);
    }
  });

  it('should accept various valid email formats', async () => {
    const mockResponse = responseFactory.success({
      data: {},
      message: { key: AUTH_SUCCESS.passwordResetSent },
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
