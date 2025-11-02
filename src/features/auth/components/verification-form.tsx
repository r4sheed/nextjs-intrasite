'use client';

import { useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { ROUTES } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';

import { execute } from '@/hooks/use-action';

import { AuthState } from '@/features/auth/components/auth-state';
import { LoadState } from '@/features/auth/components/load-state';

import { REDIRECT_TIMEOUT_MS } from '@/features/auth/lib/constants';
import { AUTH_CODES, AUTH_LABELS } from '@/features/auth/lib/strings';

import { verifyEmail } from '@/features/auth/actions';

export const EmailVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const mutation = useMutation<
    ActionSuccess<typeof verifyEmail>,
    ErrorResponse,
    string
  >({
    mutationFn: token => execute(verifyEmail, token),
  });

  useEffect(() => {
    if (!token) {
      router.replace(
        `${ROUTES.AUTH.LOGIN}?&verify_error=${AUTH_CODES.tokenInvalid}`
      );
      return;
    }

    if (!mutation.isPending && !mutation.isSuccess && !mutation.isError) {
      mutation.mutate(token);
    }
  }, [token, mutation, router]);

  useEffect(() => {
    if (mutation.isSuccess) {
      const timer = setTimeout(() => {
        router.replace(`${ROUTES.AUTH.LOGIN}?verified=1`);
      }, REDIRECT_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }

    if (mutation.isError) {
      const code = mutation.error?.code;
      router.replace(
        `${ROUTES.AUTH.LOGIN}?&verify_error=${encodeURIComponent(code)}`
      );
    }
  }, [mutation.isSuccess, mutation.isError, mutation.error, router]);

  const successMessage = mutation.data?.message?.key;

  if (mutation.isSuccess) {
    return (
      <AuthState
        title={AUTH_LABELS.verificationSuccessTitle}
        message={successMessage || AUTH_LABELS.verificationSuccessSubtitle}
      />
    );
  }

  return (
    <LoadState
      title={AUTH_LABELS.verificationProcessingTitle}
      description={AUTH_LABELS.verificationProcessingSubtitle}
    />
  );
};
