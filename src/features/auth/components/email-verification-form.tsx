'use client';

import { useEffect } from 'react';

import { useMutation } from '@tanstack/react-query';
import { CircleCheck, CircleX } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
import {
  type VerifyEmailInput,
  verifyEmailSchema,
} from '@/features/auth/schemas';
/**
 * Email verification form component
 * Handles email verification token processing and redirects
 */
export const EmailVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const hasToken = Boolean(token); // Check if token exists in URL
  const hasEmail = Boolean(email); // Check if email exists in URL

  const mutation = useMutation<
    ActionSuccess<ReturnType<typeof verifyEmail>>,
    ErrorResponse,
    VerifyEmailInput
  >({
    mutationFn: values => execute(verifyEmail, values),
  });

  const { mutate, status, isPending, isSuccess, isError, data, error } =
    mutation; // Destructure mutation state

  // Trigger verification when both email and token are present and idle
  useEffect(() => {
    if (!token || !email) {
      return;
    }

    // Validate token and email format before making API call
    const validation = verifyEmailSchema.safeParse({ token, email });
    if (!validation.success) {
      return; // Invalid token or email, will show error state
    }

    if (status === 'idle') {
      mutate({ email: validation.data.email, token: validation.data.token });
    }
  }, [token, email, mutate, status]);

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

  // Helper function to determine verification state and messages
  const getVerificationState = () => {
    const isTokenValid = token
      ? verifyEmailSchema.safeParse({ email: email || '', token }).success
      : false;

    const hasValidParams = hasToken && hasEmail && isTokenValid;

    return {
      isTokenValid,
      hasValidParams,
      successMessage:
        data?.message?.key || AUTH_LABELS.verifyEmailSuccessSubtitle,
      errorMessage: !hasValidParams
        ? AUTH_ERRORS.tokenInvalid
        : error?.message?.key || AUTH_LABELS.verifyEmailFailedSubtitle,
      showError: !hasValidParams || isError,
      showLoading: hasValidParams && (status === 'idle' || isPending),
    };
  };

  const t = useTranslations('auth');
  const state = getVerificationState();

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
              <EmptyTitle>{t(AUTH_LABELS.verifyEmailSuccessTitle)}</EmptyTitle>
              <EmptyDescription>{t(state.successMessage)}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (state.showError) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleX className="size-10" />
              </EmptyMedia>
              <EmptyTitle>{t(AUTH_LABELS.verifyEmailFailedTitle)}</EmptyTitle>
              <EmptyDescription>{t(state.errorMessage)}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  router.replace(routes.auth.login.url);
                }}
              >
                {t(AUTH_LABELS.backToLoginButton)}
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (state.showLoading) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <Spinner className="size-10" />
              </EmptyMedia>
              <EmptyTitle>
                {t(AUTH_LABELS.verifyEmailProcessingTitle)}
              </EmptyTitle>
              <EmptyDescription>
                {t(AUTH_LABELS.verifyEmailProcessingSubtitle)}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return null;
};
