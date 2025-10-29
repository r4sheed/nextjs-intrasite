'use client';

import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { type VerificationData, verify } from '@/features/auth/actions';
import { AuthState } from '@/features/auth/components/auth-state';
import { Header } from '@/features/auth/components/header';
import { LoadState } from '@/features/auth/components/load-state';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_UI_MESSAGES,
} from '@/features/auth/lib/messages';
import { execute } from '@/hooks/use-action';
import { type ErrorResponse, type SuccessResponse } from '@/lib/result';

const VerificationLoading = () => (
  <LoadState
    title={AUTH_UI_MESSAGES.VERIFICATION_PROCESSING_TITLE}
    description={AUTH_UI_MESSAGES.VERIFICATION_PROCESSING_DESCRIPTION}
  />
);

const VerificationSuccess = ({ message }: { message: string }) => (
  <AuthState
    title={AUTH_UI_MESSAGES.VERIFICATION_SUCCESS_TITLE}
    message={message}
  />
);

const VerificationError = ({ message }: { message: string }) => (
  <AuthState
    title={AUTH_UI_MESSAGES.VERIFICATION_FAILED_TITLE}
    message={message}
    variant="destructive"
  />
);

const renderForm = (formContent: React.ReactNode) => (
  <div className="p-6 md:p-8">
    <Header
      title={AUTH_UI_MESSAGES.EMAIL_VERIFICATION_TITLE}
      description={AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SUBTITLE}
    />
    {formContent}
  </div>
);

/**
 * @name EmailVerificationForm
 * @description Automatically initiates email verification upon token presence in the URL.
 * Displays success, error, or loading state based on the mutation result.
 */
export const EmailVerificationForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  /**
   * TanStack Query mutation for the verifyEmail Server Action.
   */
  const mutation = useMutation<
    SuccessResponse<VerificationData>, // TData: Success response with data
    ErrorResponse, // TError: Thrown error from 'execute'
    string // TVariables: The 'token' input
  >({
    mutationFn: token =>
      // Use the execute adapter to call the server action
      execute(verify, token) as Promise<SuccessResponse<VerificationData>>,
  });

  // Extracts success and error messages using the consistent message key pattern
  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  // Automatically trigger the mutation when the token is available
  useEffect(() => {
    // Only proceed if a token exists and the mutation hasn't been run/is not pending
    if (
      !token ||
      mutation.isPending ||
      mutation.isSuccess ||
      mutation.isError
    ) {
      return;
    }

    // Start the verification process
    mutation.mutate(token);
  }, [
    token,
    mutation.mutate,
    mutation.isPending,
    mutation.isSuccess,
    mutation.isError,
  ]);

  let content;

  if (!token) {
    // No token found in the URL
    content = (
      <VerificationError message={AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND} />
    );
  } else if (mutation.isPending) {
    content = <VerificationLoading />;
  } else if (mutation.isSuccess) {
    content = (
      <VerificationSuccess
        message={successMessage || AUTH_UI_MESSAGES.EMAIL_VERIFIED}
      />
    );
  } else if (mutation.isError) {
    // Error occurred (error caught by TanStack Query)
    content = (
      <VerificationError
        message={errorMessage || AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR}
      />
    );
  } else {
    // Default state if token is present but mutation hasn't run yet
    content = <VerificationLoading />;
  }

  return renderForm(content);
};
