import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('mail module', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    vi.restoreAllMocks();
  });

  it('constructs Resend with RESEND_API_KEY', async () => {
    // Ensure a clean module load
    vi.resetModules();

    process.env.RESEND_API_KEY = 'sk_test_local';

    // Use doMock so we can set the mock before importing the mail module
    vi.doMock('resend', () => {
      const Resend = vi
        .fn()
        .mockImplementation((key: string) => ({ apiKey: key }));
      return { Resend };
    });

    // Import module under test after mock is registered
    const mailModule = await import('@/lib/mail');
    const resend = await import('resend');

    expect(resend.Resend).toHaveBeenCalledWith('sk_test_local');
    // exported mail should be the instance returned by the mocked Resend
    expect(mailModule.mail).toEqual({ apiKey: 'sk_test_local' });
  });
});
