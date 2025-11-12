import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_CODES } from '@/features/auth/lib/strings';

import type { User as PrismaUser, UserRole } from '@prisma/client';

const createUser = (overrides: Partial<PrismaUser> = {}): PrismaUser => {
  const timestamp = new Date();

  return {
    id: 'user-id',
    name: 'Existing User',
    email: 'user@example.com',
    emailVerified: null,
    image: null,
    password: 'stored-hash',
    role: 'USER' as UserRole,
    twoFactorEnabled: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
};

describe('updateUserSettingsService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('updates the password when the current password is valid', async () => {
    const dbUser = createUser({ id: 'user-password' });
    const verifyPassword = vi.fn().mockResolvedValue(true);
    const hashPassword = vi
      .fn()
      .mockImplementation(async (password: string) => `hashed:${password}`);

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi.fn().mockResolvedValue(dbUser),
    }));

    vi.doMock('@/features/auth/data/account', () => ({
      getAccountByUserId: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock('@/features/auth/models', () => ({
      User: class {
        async verifyPassword(password: string) {
          return verifyPassword(password);
        }

        static hashPassword = hashPassword;
      },
    }));

    const updateSpy = vi.fn().mockResolvedValue({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image,
      role: dbUser.role,
      twoFactorEnabled: dbUser.twoFactorEnabled,
    });

    vi.doMock('@/lib/prisma', () => ({
      db: { user: { update: updateSpy } },
    }));

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        currentPassword: 'current-password',
        newPassword: 'next-password',
        confirmPassword: 'next-password',
      },
    });

    expect(verifyPassword).toHaveBeenCalledWith('current-password');
    expect(hashPassword).toHaveBeenCalledWith('next-password');
    expect(updateSpy).toHaveBeenCalledTimes(1);

    const updateArgs = updateSpy.mock.calls[0]?.[0] as
      | {
          where: { id: string };
          data: Record<string, unknown>;
        }
      | undefined;

    if (!updateArgs) {
      throw new Error('updateUserSettingsService did not call db.user.update');
    }

    expect(updateArgs.where).toEqual({ id: dbUser.id });
    expect(updateArgs.data).toMatchObject({ password: 'hashed:next-password' });

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      throw new Error('Expected success response');
    }
    expect(result.data?.id).toBe(dbUser.id);
  });

  it('returns an error when the current password check fails', async () => {
    const dbUser = createUser({ id: 'user-invalid-password' });
    const verifyPassword = vi.fn().mockResolvedValue(false);

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi.fn().mockResolvedValue(dbUser),
    }));

    vi.doMock('@/features/auth/data/account', () => ({
      getAccountByUserId: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock('@/features/auth/models', () => ({
      User: class {
        async verifyPassword(password: string) {
          return verifyPassword(password);
        }

        static hashPassword = vi.fn();
      },
    }));

    const updateSpy = vi.fn();

    vi.doMock('@/lib/prisma', () => ({
      db: { user: { update: updateSpy } },
    }));

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        currentPassword: 'wrong-password',
        newPassword: 'next-password',
        confirmPassword: 'next-password',
      },
    });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(result.status).toBe('error');
    if (result.status !== 'error') {
      throw new Error('Expected error response');
    }
    expect(result.code).toBe(AUTH_CODES.passwordIncorrect);
  });

  it('returns an error when the new password matches the current password', async () => {
    const dbUser = createUser({ id: 'user-same-password' });
    const verifyPassword = vi.fn();

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi.fn().mockResolvedValue(dbUser),
    }));

    vi.doMock('@/features/auth/data/account', () => ({
      getAccountByUserId: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock('@/features/auth/models', () => ({
      User: class {
        async verifyPassword(password: string) {
          verifyPassword(password);
          return true;
        }

        static hashPassword = vi.fn();
      },
    }));

    const updateSpy = vi.fn();

    vi.doMock('@/lib/prisma', () => ({
      db: { user: { update: updateSpy } },
    }));

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        currentPassword: 'same-password',
        newPassword: 'same-password',
        confirmPassword: 'same-password',
      },
    });

    expect(result.status).toBe('error');
    if (result.status !== 'error') {
      throw new Error('Expected error response');
    }

    expect(result.code).toBe(AUTH_CODES.passwordUnchanged);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it('updates two-factor state when toggled', async () => {
    const dbUser = createUser({ id: 'user-2fa', twoFactorEnabled: false });

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi.fn().mockResolvedValue(dbUser),
    }));

    vi.doMock('@/features/auth/data/account', () => ({
      getAccountByUserId: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock('@/features/auth/models', () => ({
      User: class {
        async verifyPassword() {
          return true;
        }

        static hashPassword = vi.fn();
      },
    }));

    const updateSpy = vi.fn().mockResolvedValue({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image,
      role: dbUser.role,
      twoFactorEnabled: true,
    });

    vi.doMock('@/lib/prisma', () => ({
      db: { user: { update: updateSpy } },
    }));

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: { twoFactorEnabled: true },
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const updateArgs = updateSpy.mock.calls[0]?.[0] as
      | {
          where: { id: string };
          data: Record<string, unknown>;
        }
      | undefined;

    if (!updateArgs) {
      throw new Error('updateUserSettingsService did not call db.user.update');
    }

    expect(updateArgs.where).toEqual({ id: dbUser.id });
    expect(updateArgs.data).toMatchObject({ twoFactorEnabled: true });

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      throw new Error('Expected success response');
    }
    expect(result.data?.twoFactorEnabled).toBe(true);
  });

  it('updates profile fields when name or email change', async () => {
    const dbUser = createUser({
      id: 'user-profile',
      name: 'Old Name',
      email: 'old@example.com',
    });

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi.fn().mockResolvedValue(dbUser),
    }));

    vi.doMock('@/features/auth/data/account', () => ({
      getAccountByUserId: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock('@/features/auth/models', () => ({
      User: class {
        async verifyPassword() {
          return true;
        }

        static hashPassword = vi.fn();
      },
    }));

    const updateSpy = vi.fn().mockResolvedValue({
      id: dbUser.id,
      name: 'New Name',
      email: 'new@example.com',
      image: dbUser.image,
      role: dbUser.role,
      twoFactorEnabled: dbUser.twoFactorEnabled,
    });

    vi.doMock('@/lib/prisma', () => ({
      db: { user: { update: updateSpy } },
    }));

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        name: 'New Name',
        email: 'new@example.com',
      },
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const updateArgs = updateSpy.mock.calls[0]?.[0] as
      | {
          where: { id: string };
          data: Record<string, unknown>;
        }
      | undefined;

    if (!updateArgs) {
      throw new Error('updateUserSettingsService did not call db.user.update');
    }

    expect(updateArgs.where).toEqual({ id: dbUser.id });
    expect(updateArgs.data).toMatchObject({
      name: 'New Name',
      email: 'new@example.com',
    });

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      throw new Error('Expected success response');
    }
    expect(result.data).toMatchObject({
      name: 'New Name',
      email: 'new@example.com',
    });
  });
});
