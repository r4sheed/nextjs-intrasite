import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

import { db } from '@/lib/prisma';

import { loginUser } from '@/features/auth/actions/login-user';
import { resendTwoFactor } from '@/features/auth/actions/resend-two-factor';
import { verifyTwoFactor } from '@/features/auth/actions/verify-two-factor';
import { signIn } from '@/features/auth/lib/auth';
import { TWO_FACTOR_MAX_ATTEMPTS } from '@/features/auth/lib/config';
import { AUTH_CODES } from '@/features/auth/lib/strings';
import { generateTwoFactorToken } from '@/features/auth/lib/tokens';

// Mock external dependencies
vi.mock('@/features/auth/lib/auth', () => ({
  signIn: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  db: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    twoFactorToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    twoFactorConfirmation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/features/auth/lib/mail', () => ({
  sendTwoFactorTokenEmail: vi.fn(),
}));

vi.mock('@/features/auth/data/user', () => ({
  verifyUserCredentials: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
}));

const createMockUser = (
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    emailVerified: Date;
    image: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    twoFactorEnabled: boolean;
    password: string;
    isOAuthAccount: boolean;
  }> = {}
) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: new Date(),
  image: null,
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
  twoFactorEnabled: true,
  password: 'hashed-password',
  isOAuthAccount: false,
  ...overrides,
});

const createMockToken = (
  overrides: Partial<{
    id: string;
    userId: string;
    token: string;
    attempts: number;
    expires: Date;
    createdAt: Date;
  }> = {}
) => ({
  id: 'token-123',
  userId: 'user-123',
  token: '123456',
  attempts: 0,
  expires: new Date(Date.now() + 5 * 60 * 1000),
  createdAt: new Date(),
  ...overrides,
});

const setupMocks = (
  options: {
    user?: ReturnType<typeof createMockUser>;
    token?: ReturnType<typeof createMockToken>;
    signInResult?: unknown;
    verifyCredentialsResult?: unknown;
    getUserByIdResult?: unknown;
  } = {}
) => {
  const defaultUser = options.user || createMockUser();
  const defaultToken = options.token || createMockToken();

  vi.mocked(db.user.findUnique).mockResolvedValue(defaultUser);
  vi.mocked(db.twoFactorToken.findUnique).mockResolvedValue(defaultToken);

  vi.mocked(signIn).mockResolvedValue(options.signInResult ?? undefined);

  return { defaultUser, defaultToken };
};

describe('2FA Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Successful 2FA Flow', () => {
    it('completes full 2FA authentication flow successfully', async () => {
      // Mock user with 2FA enabled
      const mockUser = createMockUser({
        id: 'cjld2cjxh0000qzrmn831i7rn',
        email: 'test@example.com',
        name: 'Test User',
      });

      const mockToken = createMockToken({
        id: 'clld0k6sr0000t3l8p17ykq5g',
        userId: mockUser.id,
        token: '123456',
      });

      setupMocks({ user: mockUser, token: mockToken });

      // Additional specific mocks for this test
      vi.mocked(db.twoFactorToken.create).mockResolvedValue(mockToken);
      vi.mocked(db.twoFactorToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(db.twoFactorConfirmation.findUnique).mockResolvedValue({
        id: 'confirmation-123',
        userId: mockUser.id,
        createdAt: new Date(),
      });

      // Mock data layer functions
      const { verifyUserCredentials, getUserById } = await import(
        '@/features/auth/data/user'
      );
      vi.mocked(verifyUserCredentials).mockResolvedValue(mockUser);
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      // Step 1: Login with valid credentials (should trigger 2FA)
      const loginResult = await loginUser({
        email: 'test@example.com',
        password: 'valid-password',
      });

      expect(loginResult.status).toBe('success');
      if (loginResult.status === 'success') {
        expect(loginResult.data?.requiresVerification).toBe(true);
        expect(loginResult.data?.redirectUrl).toContain('/verify?type=2fa');
      }

      // Step 2: Verify 2FA code (now completes authentication)
      const verifyResult = await verifyTwoFactor({
        sessionId: 'clld0k6sr0000t3l8p17ykq5g',
        code: '123456',
      });

      expect(verifyResult.status).toBe('success');
      if (verifyResult.status === 'success') {
        expect(verifyResult.data?.verified).toBe(true);
      }

      // Verify that signIn was called to complete authentication
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: '__two-factor-bypass__',
        twoFactorBypass: true,
        redirect: false,
      });
    });
  });

  describe('Failed Attempts Lockout', () => {
    it('locks out user after maximum failed verification attempts', async () => {
      const mockUser = createMockUser({ id: 'user-123' });
      const maxAttemptsToken = createMockToken({
        id: 'clld0k6sr0000t3l8p17ykq5g',
        userId: 'user-123',
        attempts: TWO_FACTOR_MAX_ATTEMPTS,
      });

      setupMocks({ user: mockUser, token: maxAttemptsToken });

      // Additional mocks for this test
      vi.mocked(db.twoFactorToken.delete).mockResolvedValue(maxAttemptsToken);
      const { getUserById } = await import('@/features/auth/data/user');
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      // Attempt verification with max attempts reached
      const result = await verifyTwoFactor({
        sessionId: 'clld0k6sr0000t3l8p17ykq5g',
        code: '123456',
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe(AUTH_CODES.twoFactorMaxAttempts);
      }
      expect(db.twoFactorToken.delete).toHaveBeenCalledWith({
        where: { id: 'clld0k6sr0000t3l8p17ykq5g' },
      });
    });

    it('increments attempts on failed verification', async () => {
      const mockUser = createMockUser({ id: 'user-123' });
      const token = createMockToken({
        id: 'cjld2cjxh0000qzrmn831i7rn',
        userId: 'user-123',
        attempts: 0,
      });

      setupMocks({ user: mockUser, token });

      // Additional mocks for this test
      vi.mocked(db.twoFactorToken.update).mockResolvedValue({
        ...token,
        attempts: 1,
      });
      const { getUserById } = await import('@/features/auth/data/user');
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      // Attempt verification with wrong code
      const result = await verifyTwoFactor({
        sessionId: 'cjld2cjxh0000qzrmn831i7rn',
        code: '999999',
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe(AUTH_CODES.twoFactorCodeInvalid);
      }
      expect(db.twoFactorToken.update).toHaveBeenCalledWith({
        where: { id: 'cjld2cjxh0000qzrmn831i7rn' },
        data: { attempts: { increment: 1 } },
      });
    });
  });

  describe('Resend Rate Limiting', () => {
    it('prevents resend within cooldown period', async () => {
      const mockUser = createMockUser({ id: 'user-123' });
      const recentToken = createMockToken({
        id: 'clld0k6sr0000t3l8p17ykq5g',
        userId: 'user-123',
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      });

      setupMocks({ user: mockUser, token: recentToken });

      // Additional mocks for this test
      vi.mocked(db.twoFactorToken.findFirst).mockResolvedValue(recentToken);
      vi.mocked(db.twoFactorToken.count).mockResolvedValue(2);
      const { getUserById } = await import('@/features/auth/data/user');
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      // Attempt resend within cooldown
      const result = await resendTwoFactor({
        sessionId: 'clld0k6sr0000t3l8p17ykq5g',
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe(AUTH_CODES.rateLimitExceeded);
      }
    });

    it('allows resend after cooldown period', async () => {
      const mockUser = createMockUser({ id: 'user-123' });
      const oldToken = createMockToken({
        id: 'clld0k6sr0000t3l8p17ykq5g',
        userId: 'user-123',
        createdAt: new Date(Date.now() - 6 * 60 * 1000), // 6 minutes ago
      });
      const newToken = createMockToken({
        id: 'clld0k6sr0000t3l8p17ykq5h',
        userId: 'user-123',
        token: '654321',
      });

      setupMocks({ user: mockUser, token: oldToken });

      // Additional mocks for this test
      vi.mocked(db.twoFactorToken.findFirst).mockResolvedValue(null); // No recent token
      vi.mocked(db.twoFactorToken.count).mockResolvedValue(1);
      vi.mocked(db.twoFactorToken.create).mockResolvedValue(newToken);
      const { getUserById } = await import('@/features/auth/data/user');
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      // Attempt resend after cooldown
      const result = await resendTwoFactor({
        sessionId: 'clld0k6sr0000t3l8p17ykq5g',
      });

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.data?.codeSent).toBe(true);
        expect(result.data?.sessionId).toBe('clld0k6sr0000t3l8p17ykq5h');
      }
    });
  });

  describe('Token Expiry', () => {
    it('rejects verification with expired token', async () => {
      const mockUser = createMockUser({ id: 'user-123' });
      const expiredToken = createMockToken({
        id: 'clld0k6sr0000t3l8p17ykq5g',
        userId: 'user-123',
        expires: new Date(Date.now() - 60 * 1000), // 1 minute ago
      });

      setupMocks({ user: mockUser, token: expiredToken });

      // Additional mocks for this test
      vi.mocked(db.twoFactorToken.delete).mockResolvedValue(expiredToken);
      const { getUserById } = await import('@/features/auth/data/user');
      vi.mocked(getUserById).mockResolvedValue(mockUser);

      // Attempt verification with expired token
      const result = await verifyTwoFactor({
        sessionId: 'clld0k6sr0000t3l8p17ykq5g',
        code: '123456',
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe(AUTH_CODES.twoFactorCodeExpired);
      }
      expect(db.twoFactorToken.delete).toHaveBeenCalledWith({
        where: { id: 'clld0k6sr0000t3l8p17ykq5g' },
      });
    });

    it('automatically cleans up expired tokens during generation', async () => {
      const mockUser = createMockUser({ id: 'user-123' });

      setupMocks({ user: mockUser });

      // Additional mocks for this test
      vi.mocked(db.twoFactorToken.findUnique).mockResolvedValue(null);
      vi.mocked(db.twoFactorToken.findFirst).mockResolvedValue(null);
      vi.mocked(db.twoFactorToken.count).mockResolvedValue(0);
      vi.mocked(db.twoFactorToken.create).mockResolvedValue(
        createMockToken({
          id: 'token-123',
          userId: 'user-123',
          token: '123456',
        })
      );
      vi.mocked(db.twoFactorToken.deleteMany).mockResolvedValue({ count: 2 });

      // Generate token (should clean up expired ones)
      await generateTwoFactorToken('user-123');

      expect(db.twoFactorToken.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });
});
