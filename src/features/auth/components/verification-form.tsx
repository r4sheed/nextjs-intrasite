'use client';

import { useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { CircleCheck } from 'lucide-react';

import { ROUTES } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';

import { execute } from '@/hooks/use-action';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';

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
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia>
            <CircleCheck className="size-10" />
          </EmptyMedia>
          <EmptyTitle>{AUTH_LABELS.verificationSuccessTitle}</EmptyTitle>
          <EmptyDescription>
            {successMessage || AUTH_LABELS.verificationSuccessSubtitle}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia>
          <Spinner className="size-10" />
        </EmptyMedia>
        <EmptyTitle>{AUTH_LABELS.verificationProcessingTitle}</EmptyTitle>
        <EmptyDescription>
          {AUTH_LABELS.verificationProcessingSubtitle}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
