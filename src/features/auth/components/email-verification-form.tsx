'use client';

import { useEffect } from 'react';

import { useMutation } from '@tanstack/react-query';
import { CircleCheck, CircleX } from 'lucide-react';

import { useRouter, useSearchParams } from 'next/navigation';

import { routes } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';

import { execute } from '@/hooks/use-action';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyContent,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';

import { verifyEmail } from '@/features/auth/actions';
import { REDIRECT_TIMEOUT_MS } from '@/features/auth/lib/config';
import { AUTH_ERRORS, AUTH_LABELS } from '@/features/auth/lib/strings';
import { verifyEmailSchema } from '@/features/auth/schemas';

/**
 * Email verification form component
 * Handles email verification token processing and redirects
 */
export const EmailVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const hasToken = Boolean(token); // Check if token exists in URL

  const mutation = useMutation<
    ActionSuccess<typeof verifyEmail>,
    ErrorResponse,
    string
  >({
    mutationFn: token => execute(verifyEmail, token),
  });

  const { mutate, status, isPending, isSuccess, isError, data, error } =
    mutation; // Destructure mutation state

  // Trigger verification when token is present and idle
  useEffect(() => {
    if (!token) {
      return;
    }

    // Validate token format before making API call
    const validation = verifyEmailSchema.safeParse({ token });
    if (!validation.success) {
      return; // Invalid token, will show error state
    }

    if (status === 'idle') {
      mutate(validation.data.token);
    }
  }, [token, mutate, status]);

  // Redirect to login after successful verification
  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      router.replace(`${routes.auth.login.url}?verified=1`);
    }, REDIRECT_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  const successMessage = data?.message?.key;
  const isTokenValid = token
    ? verifyEmailSchema.safeParse({ token }).success
    : false;
  const errorMessage = !hasToken
    ? AUTH_ERRORS.tokenInvalid
    : !isTokenValid
      ? AUTH_ERRORS.tokenInvalid
      : error?.message?.key || AUTH_LABELS.verificationFailedSubtitle;
  const showError = !hasToken || !isTokenValid || isError; // Show error if no token, invalid token, or verification failed
  const showLoading =
    hasToken && isTokenValid && (status === 'idle' || isPending); // Show loading only for valid tokens

  // Success state
  if (isSuccess) {
    return (
      <Card>
        <CardContent>
          <Empty>
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
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (showError) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleX className="size-10" />
              </EmptyMedia>
              <EmptyTitle>{AUTH_LABELS.verificationFailedTitle}</EmptyTitle>
              <EmptyDescription>
                {errorMessage || AUTH_LABELS.verificationFailedSubtitle}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  router.replace(routes.auth.login.url);
                }}
              >
                {AUTH_LABELS.backToLoginButton}
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (showLoading) {
    return (
      <Card>
        <CardContent>
          <Empty>
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
        </CardContent>
      </Card>
    );
  }

  return null;
};
