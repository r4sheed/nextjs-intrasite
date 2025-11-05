import { beforeEach, describe, expect, it, vi } from 'vitest';

import { response as responseFactory, Status } from '@/lib/response';

import { verifyTwoFactor } from '@/features/auth/actions';
import { twoFactorSessionMissing } from '@/features/auth/lib/errors';
import { AUTH_CODES } from '@/features/auth/lib/strings';
import {
  type VerifyTwoFactorData,
  verifyTwoFactorCode,
} from '@/features/auth/services/verify-two-factor';

vi.mock('@/features/auth/services/verify-two-factor', () => ({
  verifyTwoFactorCode: vi.fn(),
}));

describe('verifyTwoFactor action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns invalidFields when validation fails', async () => {
    const response = await verifyTwoFactor({
      sessionId: 'invalid-session',
      code: '123456',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.invalidFields);
    }

    expect(verifyTwoFactorCode).not.toHaveBeenCalled();
  });

  it('returns success when service resolves successfully', async () => {
    const payload: VerifyTwoFactorData = {
      userId: 'user-1',
      email: 'user@example.com',
      verified: true,
    };
    const mockResponse = responseFactory.success({
      data: payload,
    });

    vi.mocked(verifyTwoFactorCode).mockResolvedValue(mockResponse);

    const response = await verifyTwoFactor({
      sessionId: 'clld0k6sr0000t3l8p17ykq5g',
      code: '654321',
    });

    expect(verifyTwoFactorCode).toHaveBeenCalledWith(
      'clld0k6sr0000t3l8p17ykq5g',
      '654321'
    );
    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      if (!response.data) {
        throw new Error('Expected success response to include data');
      }
      expect(response.data.verified).toBe(true);
      expect(response.data.userId).toBe('user-1');
    }
  });

  it('propagates failure from service layer', async () => {
    const failure = responseFactory.failure(twoFactorSessionMissing());
    vi.mocked(verifyTwoFactorCode).mockResolvedValue(failure);

    const response = await verifyTwoFactor({
      sessionId: 'clld0k6sr0000t3l8p17ykq5g',
      code: '123456',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(failure.code);
    }
  });
});
