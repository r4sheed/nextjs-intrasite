import { beforeEach, describe, expect, it, vi } from 'vitest';

import { response as responseFactory, Status } from '@/lib/response';

import { resendTwoFactor } from '@/features/auth/actions';
import { twoFactorSessionMissing } from '@/features/auth/lib/errors';
import { AUTH_CODES, AUTH_SUCCESS } from '@/features/auth/lib/strings';
import {
  type ResendTwoFactorData,
  resendTwoFactorCode,
} from '@/features/auth/services/resend-two-factor';

vi.mock('@/features/auth/services/resend-two-factor', () => ({
  resendTwoFactorCode: vi.fn(),
}));

describe('resendTwoFactor action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns invalidFields when sessionId is malformed', async () => {
    const response = await resendTwoFactor({ sessionId: 'not-a-cuid' });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.invalidFields);
    }
    expect(resendTwoFactorCode).not.toHaveBeenCalled();
  });

  it('returns success when service returns success', async () => {
    const payload: ResendTwoFactorData = {
      codeSent: true,
      sessionId: 'clld0k6sr0000t3l8p17ykq5g',
    };
    const mockResponse = responseFactory.success({
      data: payload,
      message: { key: AUTH_SUCCESS.twoFactorSent },
    });

    vi.mocked(resendTwoFactorCode).mockResolvedValue(mockResponse);

    const response = await resendTwoFactor({
      sessionId: 'clld0k6sr0000t3l8p17ykq5g',
    });

    expect(resendTwoFactorCode).toHaveBeenCalledWith(
      'clld0k6sr0000t3l8p17ykq5g'
    );
    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      if (!response.data) {
        throw new Error('Expected success response to include data');
      }
      expect(response.data.codeSent).toBe(true);
      expect(response.data.sessionId).toBe('clld0k6sr0000t3l8p17ykq5g');
      expect(response.message?.key).toBe(AUTH_SUCCESS.twoFactorSent);
    }
  });

  it('propagates failure from service layer', async () => {
    const failure = responseFactory.failure(twoFactorSessionMissing());
    vi.mocked(resendTwoFactorCode).mockResolvedValue(failure);

    const response = await resendTwoFactor({
      sessionId: 'clld0k6sr0000t3l8p17ykq5g',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(failure.code);
    }
  });
});
