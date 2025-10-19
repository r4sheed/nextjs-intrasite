'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type Response, Status } from '@/lib/response';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';

interface UseAuthActionOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * Hook for handling auth actions with proper error handling
 * Simplifies form submission and error display
 */
export function useAuthAction<TData>(options: UseAuthActionOptions = {}) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const { onSuccess, redirectTo = DEFAULT_LOGIN_REDIRECT } = options;

  async function execute(
    action: () => Promise<Response<TData>>
  ): Promise<void> {
    setError(undefined);

    startTransition(async () => {
      try {
        const response = await action();

        if (response.status === Status.Error) {
          // Extract error message
          const errorMsg =
            typeof response.error.message === 'string'
              ? response.error.message
              : response.error.message.key;

          setError(errorMsg);
          return;
        }

        if (response.status === Status.Success) {
          setError(undefined);

          if (onSuccess) {
            onSuccess();
          } else {
            router.push(redirectTo);
          }
        }
      } catch (err) {
        // Handle unexpected errors
        setError('An unexpected error occurred. Please try again.');
      }
    });
  }

  return {
    execute,
    error,
    setError,
    isPending,
  };
}
