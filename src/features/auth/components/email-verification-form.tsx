'use client';

import { useEffect } from 'react';

import { useMutation } from '@tanstack/react-query';
import { CircleCheck } from 'lucide-react';

import { useRouter, useSearchParams } from 'next/navigation';

import { routes } from '@/lib/navigation';
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

import { verifyEmail } from '@/features/auth/actions';
import { REDIRECT_TIMEOUT_MS } from '@/features/auth/lib/config';
import { AUTH_CODES, AUTH_LABELS } from '@/features/auth/lib/strings';

/**
 * Email verification form component
 * Handles email verification token processing and redirects
 */
export const EmailVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Mutation for email verification
  const mutation = useMutation<
    ActionSuccess<typeof verifyEmail>,
    ErrorResponse,
    string
  >({
    mutationFn: token => execute(verifyEmail, token),
  });

  // Handle token validation and verification trigger
  useEffect(() => {
    if (!token) {
      // Redirect with error if no token
      router.replace(
        `${routes.auth.login.url}?&verify_error=${AUTH_CODES.tokenInvalid}`
      );
      return;
    }

    // Trigger verification if not already started
    if (!mutation.isPending && !mutation.isSuccess && !mutation.isError) {
      mutation.mutate(token);
    }
  }, [token, mutation, router]);

  // Handle verification result redirects
  useEffect(() => {
    if (mutation.isSuccess) {
      // Redirect to login with success indicator after delay
      const timer = setTimeout(() => {
        router.replace(`${routes.auth.login.url}?verified=1`);
      }, REDIRECT_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }

    if (mutation.isError) {
      // Redirect to login with error code
      const code = mutation.error?.code;
      router.replace(
        `${routes.auth.login.url}?&verify_error=${encodeURIComponent(code)}`
      );
    }

    return undefined;
  }, [mutation.isSuccess, mutation.isError, mutation.error, router]);

  const successMessage = mutation.data?.message?.key;

  // Show success state
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

  // Show loading state
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
