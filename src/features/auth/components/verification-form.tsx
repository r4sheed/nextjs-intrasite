'use client';

import { useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { ROUTES } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';

import { execute } from '@/hooks/use-action';

import { AuthState } from '@/features/auth/components/auth-state';
import { LoadState } from '@/features/auth/components/load-state';

import { AUTH_ERROR_CODES } from '@/features/auth/lib/codes';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';

import { verifyEmail } from '@/features/auth/actions';

AUTH_ERROR_CODES;
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
        `${ROUTES.AUTH.LOGIN}?&verify_error=${AUTH_ERROR_CODES.AUTH_TOKEN_NOT_FOUND}`
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
      }, 2500);
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
        title={AUTH_UI_MESSAGES.VERIFICATION_SUCCESS_TITLE}
        message={successMessage || AUTH_UI_MESSAGES.EMAIL_VERIFIED}
      />
    );
  }

  return (
    <LoadState
      title={AUTH_UI_MESSAGES.VERIFICATION_PROCESSING_TITLE}
      description={AUTH_UI_MESSAGES.VERIFICATION_PROCESSING_DESCRIPTION}
    />
  );
};
