import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CORE_CODES } from '@/lib/errors/codes';
import { response as responseFactory, Status } from '@/lib/response';

import { loginUser as loginUserAction } from '@/features/auth/actions';
import { invalidCredentials } from '@/features/auth/lib/errors';
import { AUTH_CODES } from '@/features/auth/lib/strings';
import { loginUser } from '@/features/auth/services';

// Mock the service layer
vi.mock('@/features/auth/services', () => ({
  loginUser: vi.fn(),
}));

describe('loginUser action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid credentials', async () => {
    const mockResponse = responseFactory.success({
      data: { userId: 'test@example.com' },
    });
    vi.mocked(loginUser).mockResolvedValue(mockResponse);

    const response = await loginUserAction({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.data).toEqual({ userId: 'test@example.com' });
      expect(response.data?.userId).toBe('test@example.com');
    }
  });

  it('should return error for invalid email format', async () => {
    const response = await loginUserAction({
      email: 'invalid-email',
      password: 'password123',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(CORE_CODES.validationFailed);
      expect(response.details).toBeDefined();
    }
  });

  it('should return error for missing password', async () => {
    const response = await loginUserAction({
      email: 'test@example.com',
      password: '',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(CORE_CODES.validationFailed);
      expect(response.details).toBeDefined();
    }
  });

  it('should return error for invalid credentials', async () => {
    const mockResponse = responseFactory.failure(invalidCredentials());
    vi.mocked(loginUser).mockResolvedValue(mockResponse);

    const response = await loginUserAction({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.invalidCredentials);
    }
  });
});
