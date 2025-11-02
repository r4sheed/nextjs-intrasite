import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPasswordResetTokenByEmail,
  getPasswordResetTokenByToken,
} from '@/features/auth/data/reset-token';
import { TOKEN_LIFETIME_MS } from '@/features/auth/lib/constants';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  db: {
    passwordResetToken: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('Password Reset Token Data Layer', () => {
  let mockFindUnique: any;
  let mockFindFirst: any;

  beforeAll(async () => {
    const { db } = await import('@/lib/prisma');
    mockFindUnique = vi.mocked(db.passwordResetToken.findUnique);
    mockFindFirst = vi.mocked(db.passwordResetToken.findFirst);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPasswordResetTokenByToken', () => {
    it('should return token when found by unique token', async () => {
      const mockToken = {
        id: 'reset-token-123',
        email: 'test@example.com',
        token: 'password-reset-token-abc',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      };

      mockFindUnique.mockResolvedValue(mockToken);

      const result = await getPasswordResetTokenByToken(
        'password-reset-token-abc'
      );

      expect(result).toEqual(mockToken);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { token: 'password-reset-token-abc' },
      });
    });

    it('should return null when token not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getPasswordResetTokenByToken('nonexistent-token');

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { token: 'nonexistent-token' },
      });
    });

    it('should return null when database error occurs', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      const result = await getPasswordResetTokenByToken('test-token');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[findPasswordResetToken] Database error:',
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle various token formats', async () => {
      const tokens = [
        'simple-reset-token',
        'token-with-dashes-456',
        'RESET_TOKEN_UPPERCASE',
        'R3s3t-T0k3n_123',
      ];

      for (const token of tokens) {
        const mockToken = {
          id: 'reset-token-123',
          email: 'test@example.com',
          token,
          expires: new Date(),
        };

        mockFindUnique.mockResolvedValue(mockToken);

        const result = await getPasswordResetTokenByToken(token);

        expect(result).toEqual(mockToken);
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { token } });

        vi.clearAllMocks();
      }
    });

    it('should return expired token if found (expiration check is service responsibility)', async () => {
      const expiredToken = {
        id: 'reset-token-123',
        email: 'test@example.com',
        token: 'expired-reset-token',
        expires: new Date(Date.now() - TOKEN_LIFETIME_MS), // 1 hour ago
      };

      mockFindUnique.mockResolvedValue(expiredToken);

      const result = await getPasswordResetTokenByToken('expired-reset-token');

      // Data layer returns the token, service layer checks expiration
      expect(result).toEqual(expiredToken);
    });
  });

  describe('getPasswordResetTokenByEmail', () => {
    it('should return first token when found by email', async () => {
      const mockToken = {
        id: 'reset-token-123',
        email: 'test@example.com',
        token: 'password-reset-token-abc',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      };

      mockFindFirst.mockResolvedValue(mockToken);

      const result = await getPasswordResetTokenByEmail('test@example.com');

      expect(result).toEqual(mockToken);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when no token found for email', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await getPasswordResetTokenByEmail('unknown@example.com');

      expect(result).toBeNull();
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { email: 'unknown@example.com' },
      });
    });

    it('should return null when database error occurs', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const dbError = new Error('Database connection timeout');
      mockFindFirst.mockRejectedValue(dbError);

      const result = await getPasswordResetTokenByEmail('test@example.com');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[findPasswordResetToken] Database error:',
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle various email formats', async () => {
      const emails = [
        'simple@example.com',
        'user.name@example.co.uk',
        'user+tag@domain.com',
        'test_user@sub.domain.org',
      ];

      for (const email of emails) {
        const mockToken = {
          id: 'reset-token-123',
          email,
          token: 'test-reset-token',
          expires: new Date(),
        };

        mockFindFirst.mockResolvedValue(mockToken);

        const result = await getPasswordResetTokenByEmail(email);

        expect(result).toEqual(mockToken);
        expect(mockFindFirst).toHaveBeenCalledWith({ where: { email } });

        vi.clearAllMocks();
      }
    });

    it('should return first token when multiple tokens exist for same email', async () => {
      // This tests that findFirst is used, which returns only one token
      const firstToken = {
        id: 'reset-token-1',
        email: 'test@example.com',
        token: 'first-reset-token',
        expires: new Date(),
      };

      mockFindFirst.mockResolvedValue(firstToken);

      const result = await getPasswordResetTokenByEmail('test@example.com');

      // Should return the first token found
      expect(result).toEqual(firstToken);
      expect(mockFindFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling consistency', () => {
    it('should handle network errors the same way as database errors', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const networkError = new Error('Network request failed');
      mockFindUnique.mockRejectedValue(networkError);

      const result1 = await getPasswordResetTokenByToken('test-token');
      expect(result1).toBeNull();

      const dbError = new Error('Connection pool exhausted');
      mockFindFirst.mockRejectedValue(dbError);

      const result2 = await getPasswordResetTokenByEmail('test@example.com');
      expect(result2).toBeNull();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
    });

    it('should log errors but not throw them', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Test error');
      mockFindUnique.mockRejectedValue(error);

      // Should not throw, should return null
      await expect(
        getPasswordResetTokenByToken('test-token')
      ).resolves.toBeNull();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle Prisma-specific errors', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Simulate a Prisma error
      const prismaError = Object.assign(new Error('Prisma Error'), {
        code: 'P2002',
        meta: { target: ['token'] },
      });

      mockFindUnique.mockRejectedValue(prismaError);

      const result = await getPasswordResetTokenByToken('test-token');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[findPasswordResetToken] Database error:',
        prismaError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('comparison with verification token behavior', () => {
    it('should behave consistently with verification token data layer', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Both should return null on error
      const error = new Error('Database error');
      mockFindUnique.mockRejectedValue(error);

      const resetTokenResult = await getPasswordResetTokenByToken('test');
      expect(resetTokenResult).toBeNull();

      mockFindFirst.mockRejectedValue(error);

      const resetTokenByEmailResult =
        await getPasswordResetTokenByEmail('test@example.com');
      expect(resetTokenByEmailResult).toBeNull();

      // Both should log errors
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
    });
  });
});
