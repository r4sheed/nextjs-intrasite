'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useAction } from '@/hooks/use-action';
import { type Response, Status } from '@/lib/response';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';

interface UseAuthActionOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * An authentication-specific hook built upon `useAction` that adds
 * automatic redirect logic on success.
 *
 * @template TData The type of data expected from the auth action.
 * @param {UseAuthActionOptions} options Configuration for success handling.
 *
 * @returns The complete state and functions from `useAction`, with the
 * `execute` function wrapped to handle success logic.
 */
export function useAuthAction<TData>(options: UseAuthActionOptions = {}) {
  const router = useRouter();

  // 1. Get the full state and functions from the base hook
  const actionState = useAction<TData>();

  // 2. Destructure the *state* for the useEffect and the *stable function* for the useCallback
  const { status, message, execute: baseExecute } = actionState;
  const { onSuccess, redirectTo = DEFAULT_LOGIN_REDIRECT } = options;

  const hasHandledSuccessRef = useRef(false);

  /**
   * Wraps the base `execute` function to reset success handling logic.
   * This function is now stable because `baseExecute` is stable.
   */
  const execute = useCallback(
    async (
      action: () => Promise<Response<TData>>
    ): Promise<Response<TData>> => {
      hasHandledSuccessRef.current = false;
      // Call the stable base function
      return await baseExecute(action);
    },
    [baseExecute]
  );

  /**
   * Effect to handle success conditions (redirect or callback).
   * This correctly depends on state variables.
   */
  useEffect(() => {
    if (status === Status.Success && !hasHandledSuccessRef.current) {
      hasHandledSuccessRef.current = true;

      if (message.success) {
        return;
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    }
  }, [status, message.success, onSuccess, redirectTo, router]);

  // Return the entire state from useAction, but override
  // `execute` with our wrapped, stable version.
  return {
    ...actionState,
    execute,
  };
}
