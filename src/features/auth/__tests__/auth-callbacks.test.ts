import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@/features/auth/data/user', () => ({
  getUserById: vi.fn(),
}));

import { getUserById } from '@/features/auth/data/user';
import { authCallbacks } from '@/features/auth/lib/auth';

import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

const mockedGetUserById = vi.mocked(getUserById);

describe('auth callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('jwt', () => {
    it('hydrates the token with fresh database values', async () => {
      mockedGetUserById.mockResolvedValueOnce({
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        image: 'alice.png',
        role: 'ADMIN',
      } as never);

      const token = { sub: 'user-1' } as JWT;

      const result = await authCallbacks.jwt({
        token,
        user: undefined,
      } as unknown as Parameters<NonNullable<typeof authCallbacks.jwt>>[0]);

      expect(mockedGetUserById).toHaveBeenCalledWith('user-1');
      expect(result.role).toBe('ADMIN');
      expect(result.email).toBe('alice@example.com');
      expect(result.picture).toBe('alice.png');
    });

    it('clears privileged fields when the user no longer exists', async () => {
      mockedGetUserById.mockResolvedValueOnce(null);

      const token = {
        sub: 'missing-user',
        role: 'ADMIN',
        email: 'old@example.com',
        picture: 'old.png',
      } as JWT;

      const result = await authCallbacks.jwt({
        token,
        user: undefined,
      } as unknown as Parameters<NonNullable<typeof authCallbacks.jwt>>[0]);

      expect(mockedGetUserById).toHaveBeenCalledWith('missing-user');
      expect(result.role).toBeUndefined();
      expect(result.email).toBeNull();
      expect(result.picture).toBeNull();
    });
  });

  describe('session', () => {
    it('projects token values onto the session user', async () => {
      const session: Session = {
        user: {
          id: 'user-1',
          name: null,
          email: null,
          image: null,
          role: undefined,
        },
        expires: new Date().toISOString(),
      };

      const token = {
        sub: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        picture: 'alice.png',
        role: 'ADMIN',
      } as JWT;

      const result = await authCallbacks.session({
        session,
        token,
      } as Parameters<NonNullable<typeof authCallbacks.session>>[0]);

      expect(result?.user.id).toBe('user-1');
      expect(result?.user.name).toBe('Alice');
      expect(result?.user.email).toBe('alice@example.com');
      expect(result?.user.image).toBe('alice.png');
      expect(result?.user.role).toBe('ADMIN');
    });

    it('preserves existing session fields when the token lacks data', async () => {
      const session: Session = {
        user: {
          id: 'user-1',
          name: 'Persisted',
          email: 'persisted@example.com',
          image: 'persisted.png',
          role: 'MODERATOR',
        },
        expires: new Date().toISOString(),
      };

      const token = {
        sub: 'user-1',
      } as JWT;

      const result = await authCallbacks.session({
        session,
        token,
      } as Parameters<NonNullable<typeof authCallbacks.session>>[0]);

      expect(result?.user.id).toBe('user-1');
      expect(result?.user.name).toBe('Persisted');
      expect(result?.user.email).toBe('persisted@example.com');
      expect(result?.user.image).toBe('persisted.png');
      expect(result?.user.role).toBe('MODERATOR');
    });
  });
});
