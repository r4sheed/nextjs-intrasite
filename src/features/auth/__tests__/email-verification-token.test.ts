import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getVerificationTokenByEmail,
  getVerificationTokenByEmailAndToken,
  getVerificationTokenByToken,
} from '@/features/auth/data/email-verification-token';
import { TOKEN_LIFETIME_MS } from '@/features/auth/lib/config';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  db: {
    emailVerificationToken: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('Email Verification Token Data Layer', () => {
  let mockFindUnique: ReturnType<typeof vi.fn>;
  let mockFindFirst: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    const { db } = await import('@/lib/prisma');
    mockFindUnique = vi.mocked(db.emailVerificationToken.findUnique);
    mockFindFirst = vi.mocked(db.emailVerificationToken.findFirst);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVerificationTokenByToken', () => {
    it('should return token when found by unique token', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'verification-token-abc',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      };

      mockFindUnique.mockResolvedValue(mockToken);

      const result = await getVerificationTokenByToken(
        'verification-token-abc'
      );

      expect(result).toEqual(mockToken);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { token: 'verification-token-abc' },
      });
    });

    it('should return null when token not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getVerificationTokenByToken('nonexistent-token');

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

      const result = await getVerificationTokenByToken('test-token');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[findVerificationToken] Database error:',
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle various token formats', async () => {
      const tokens = [
        'simple-token',
        'token-with-dashes-123',
        'TOKEN_UPPERCASE',
        'mix3d-Ch4rs_T0k3n',
      ];

      for (const token of tokens) {
        const mockToken = {
          id: 'token-123',
          email: 'test@example.com',
          token,
          expires: new Date(),
        };

        mockFindUnique.mockResolvedValue(mockToken);

        const result = await getVerificationTokenByToken(token);

        expect(result).toEqual(mockToken);
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { token } });

        vi.clearAllMocks();
      }
    });

    it('should return expired token if found (expiration check is service responsibility)', async () => {
      const expiredToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'expired-token',
        expires: new Date(Date.now() - TOKEN_LIFETIME_MS), // 1 hour ago
      };

      mockFindUnique.mockResolvedValue(expiredToken);

      const result = await getVerificationTokenByToken('expired-token');

      // Data layer returns the token, service layer checks expiration
      expect(result).toEqual(expiredToken);
    });
  });

  describe('getVerificationTokenByEmail', () => {
    it('should return first token when found by email', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'verification-token-abc',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      };

      mockFindFirst.mockResolvedValue(mockToken);

      const result = await getVerificationTokenByEmail('test@example.com');

      expect(result).toEqual(mockToken);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when no token found for email', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await getVerificationTokenByEmail('unknown@example.com');

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

      const result = await getVerificationTokenByEmail('test@example.com');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[findVerificationToken] Database error:',
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
          id: 'token-123',
          email,
          token: 'test-token',
          expires: new Date(),
        };

        mockFindFirst.mockResolvedValue(mockToken);

        const result = await getVerificationTokenByEmail(email);

        expect(result).toEqual(mockToken);
        expect(mockFindFirst).toHaveBeenCalledWith({ where: { email } });

        vi.clearAllMocks();
      }
    });

    it('should return first token when multiple tokens exist for same email', async () => {
      // This tests that findFirst is used, which returns only one token
      const firstToken = {
        id: 'token-1',
        email: 'test@example.com',
        token: 'first-token',
        expires: new Date(),
      };

      mockFindFirst.mockResolvedValue(firstToken);

      const result = await getVerificationTokenByEmail('test@example.com');

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

      const result1 = await getVerificationTokenByToken('test-token');
      expect(result1).toBeNull();

      const dbError = new Error('Connection pool exhausted');
      mockFindFirst.mockRejectedValue(dbError);

      const result2 = await getVerificationTokenByEmail('test@example.com');
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
        getVerificationTokenByToken('test-token')
      ).resolves.toBeNull();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getVerificationTokenByEmailAndToken', () => {
    it('should return token when found by email and token combination', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'verification-token-abc',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      };

      mockFindUnique.mockResolvedValue(mockToken);

      const result = await getVerificationTokenByEmailAndToken(
        'test@example.com',
        'verification-token-abc'
      );

      expect(result).toEqual(mockToken);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          email_token: {
            email: 'test@example.com',
            token: 'verification-token-abc',
          },
        },
      });
    });

    it('should return null when token not found for email+token combination', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getVerificationTokenByEmailAndToken(
        'test@example.com',
        'nonexistent-token'
      );

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          email_token: {
            email: 'test@example.com',
            token: 'nonexistent-token',
          },
        },
      });
    });

    it('should return null when database error occurs', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      const result = await getVerificationTokenByEmailAndToken(
        'test@example.com',
        'test-token'
      );

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[getVerificationTokenByEmailAndToken] Database error:',
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle various email and token combinations', async () => {
      const testCases = [
        {
          email: 'user@example.com',
          token: 'simple-token',
        },
        {
          email: 'test.user@domain.co.uk',
          token: 'token-with-dashes-123',
        },
        {
          email: 'admin@test.org',
          token: 'UPPERCASE_TOKEN_ABC',
        },
      ];

      for (const { email, token } of testCases) {
        const mockToken = {
          id: 'token-123',
          email,
          token,
          expires: new Date(),
        };

        mockFindUnique.mockResolvedValue(mockToken);

        const result = await getVerificationTokenByEmailAndToken(email, token);

        expect(result).toEqual(mockToken);
        expect(mockFindUnique).toHaveBeenCalledWith({
          where: {
            email_token: {
              email,
              token,
            },
          },
        });

        vi.clearAllMocks();
      }
    });

    it('should return expired token if found (expiration check is service responsibility)', async () => {
      const expiredToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'expired-token',
        expires: new Date(Date.now() - TOKEN_LIFETIME_MS), // 1 hour ago
      };

      mockFindUnique.mockResolvedValue(expiredToken);

      const result = await getVerificationTokenByEmailAndToken(
        'test@example.com',
        'expired-token'
      );

      // Data layer returns the token, service layer checks expiration
      expect(result).toEqual(expiredToken);
    });

    it('should distinguish between tokens for different emails', async () => {
      // Same token for different emails should return different results
      const token1 = {
        id: 'token-1',
        email: 'user1@example.com',
        token: 'same-token',
        expires: new Date(),
      };

      const token2 = {
        id: 'token-2',
        email: 'user2@example.com',
        token: 'same-token',
        expires: new Date(),
      };

      // First call returns token1
      mockFindUnique.mockResolvedValueOnce(token1);
      const result1 = await getVerificationTokenByEmailAndToken(
        'user1@example.com',
        'same-token'
      );
      expect(result1).toEqual(token1);

      // Second call returns token2
      mockFindUnique.mockResolvedValueOnce(token2);
      const result2 = await getVerificationTokenByEmailAndToken(
        'user2@example.com',
        'same-token'
      );
      expect(result2).toEqual(token2);

      expect(mockFindUnique).toHaveBeenCalledTimes(2);
    });
  });
});
