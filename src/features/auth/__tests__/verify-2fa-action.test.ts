import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CORE_CODES } from '@/lib/errors/codes';
import { Status } from '@/lib/response';

import { verify2fa } from '@/features/auth/actions';
import { getTwoFactorConfirmationByUserId } from '@/features/auth/data/two-factor-confirmation';
import { signIn } from '@/features/auth/lib/auth';
import { TWO_FACTOR_BYPASS_PLACEHOLDER } from '@/features/auth/lib/config';
import { AUTH_CODES } from '@/features/auth/lib/strings';

vi.mock('@/features/auth/data/two-factor-confirmation', () => ({
  getTwoFactorConfirmationByUserId: vi.fn(),
}));

vi.mock('@/features/auth/lib/auth', () => ({
  signIn: vi.fn(),
}));

describe('verify2fa action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns invalidFields when validation fails', async () => {
    const response = await verify2fa({
      email: 'not-an-email',
      userId: 'invalid-cuid',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.invalidFields);
    }

    expect(getTwoFactorConfirmationByUserId).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('returns error when confirmation record is missing', async () => {
    vi.mocked(getTwoFactorConfirmationByUserId).mockResolvedValue(null);

    const response = await verify2fa({
      email: 'user@example.com',
      userId: 'clld0k6sr0000t3l8p17ykq5g',
    });

    expect(getTwoFactorConfirmationByUserId).toHaveBeenCalledWith(
      'clld0k6sr0000t3l8p17ykq5g'
    );
    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.userNotFound);
    }
    expect(signIn).not.toHaveBeenCalled();
  });

  it('calls signIn and returns success when confirmation exists', async () => {
    vi.mocked(getTwoFactorConfirmationByUserId).mockResolvedValue({
      id: 'confirmation-id',
      userId: 'clld0k6sr0000t3l8p17ykq5g',
    });

    const response = await verify2fa({
      email: 'user@example.com',
      userId: 'clld0k6sr0000t3l8p17ykq5g',
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'user@example.com',
      password: TWO_FACTOR_BYPASS_PLACEHOLDER,
      twoFactorBypass: true,
      redirect: false,
    });
    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.data?.success).toBe(true);
    }
  });

  it('returns internalServerError when signIn throws', async () => {
    vi.mocked(getTwoFactorConfirmationByUserId).mockResolvedValue({
      id: 'confirmation-id',
      userId: 'clld0k6sr0000t3l8p17ykq5g',
    });
    vi.mocked(signIn).mockRejectedValue(new Error('Unexpected'));

    const response = await verify2fa({
      email: 'user@example.com',
      userId: 'clld0k6sr0000t3l8p17ykq5g',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(CORE_CODES.internalServerError);
    }
  });
});
