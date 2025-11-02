import { beforeEach, describe, expect, it, vi } from 'vitest';

import { response as responseFactory, Status } from '@/lib/response';

import {
  emailAlreadyExists,
  registrationFailed,
} from '@/features/auth/lib/errors';
import { AUTH_CODES } from '@/features/auth/lib/strings';

import { registerUser as registerUserAction } from '@/features/auth/actions';
import { registerUser } from '@/features/auth/services';

// Mock the service layer
vi.mock('@/features/auth/services', () => ({
  registerUser: vi.fn(),
}));

describe('registerUser action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid registration', async () => {
    const mockResponse = responseFactory.success({
      data: { userId: 'newuser@example.com' },
    });
    vi.mocked(registerUser).mockResolvedValue(mockResponse);

    const response = await registerUserAction({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.data).toEqual({ userId: 'newuser@example.com' });
      expect(response.data?.userId).toBe('newuser@example.com');
    }
  });

  it('should return error for invalid email format', async () => {
    const response = await registerUserAction({
      name: 'Test User',
      email: 'invalid-email',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.invalidFields);
      expect(response.details).toBeDefined();
    }
  });

  it('should return error for missing name', async () => {
    const response = await registerUserAction({
      name: '',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.invalidFields);
      expect(response.details).toBeDefined();
    }
  });

  it('should return error for email already in use', async () => {
    const mockResponse = responseFactory.failure(emailAlreadyExists());
    vi.mocked(registerUser).mockResolvedValue(mockResponse);

    const response = await registerUserAction({
      name: 'Test User',
      email: 'existing@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.emailExists);
    }
  });

  it('should return error for registration error', async () => {
    const mockResponse = responseFactory.failure(registrationFailed({}));
    vi.mocked(registerUser).mockResolvedValue(mockResponse);

    const response = await registerUserAction({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.registrationFailed);
    }
  });
});
