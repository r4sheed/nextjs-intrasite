import { beforeEach, describe, expect, it, vi } from 'vitest';

import { login } from '@/features/auth/actions';
import { AuthErrorDefinitions } from '@/features/auth/lib/errors';
import { loginUser } from '@/features/auth/services';
import { Status, failure, success } from '@/lib/response';

// Mock the service layer
vi.mock('@/features/auth/services', () => ({
  loginUser: vi.fn(),
}));

describe('login action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid credentials', async () => {
    const mockResponse = success({ userId: 'test@example.com' });
    vi.mocked(loginUser).mockResolvedValue(mockResponse);

    const response = await login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.data).toEqual({ userId: 'test@example.com' });
      expect(response.data.userId).toBe('test@example.com');
    }
  });

  it('should return error for invalid email format', async () => {
    const response = await login({
      email: 'invalid-email',
      password: 'password123',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.error.code).toBe('AUTH_INVALID_FIELDS');
      expect(response.error.details).toBeDefined();
    }
  });

  it('should return error for missing password', async () => {
    const response = await login({
      email: 'test@example.com',
      password: '',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.error.code).toBe('AUTH_INVALID_FIELDS');
      expect(response.error.details).toBeDefined();
    }
  });

  it('should return error for invalid credentials', async () => {
    const mockResponse = failure(AuthErrorDefinitions.INVALID_CREDENTIALS);
    vi.mocked(loginUser).mockResolvedValue(mockResponse);

    const response = await login({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    }
  });
});
