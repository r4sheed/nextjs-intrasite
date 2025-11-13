'use client';

import { useSearchParams } from 'next/navigation';

import { EmailVerificationForm } from './email-verification-form';
import { TwoFactorVerificationForm } from './two-factor-verification-form';

/**
 * Routes between different verification types based on URL query params.
 *
 * Supported verification types:
 * - ?type=email&token=... - Email address verification
 * - ?type=2fa - Two-factor authentication code verification
 *
 * Defaults to email verification for backward compatibility.
 */
export const VerificationRouter = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  if (type === '2fa') {
    return <TwoFactorVerificationForm />;
  }

  // Default to email verification (backward compatible)
  return <EmailVerificationForm />;
};
