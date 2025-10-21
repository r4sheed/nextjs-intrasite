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
 * Auth-specific hook with redirect logic
 * If success message exists, no redirect (e.g., email verification)
 * Otherwise redirects on success
 */
export function useAuthAction<TData>(options: UseAuthActionOptions = {}) {
  const router = useRouter();
  const actionState = useAction<TData>();
  const hasRedirectedRef = useRef(false);

  const { onSuccess, redirectTo = DEFAULT_LOGIN_REDIRECT } = options;

  const execute = useCallback(
    async (action: () => Promise<Response<TData>>): Promise<void> => {
      hasRedirectedRef.current = false;
      await actionState.execute(action);
    },
    [actionState]
  );

  // Handle redirect on success (only if no success message)
  useEffect(() => {
    if (actionState.status === Status.Success && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;

      // If success message exists, don't redirect (show message instead)
      if (actionState.message.success) {
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    }
  }, [
    actionState.status,
    actionState.message.success,
    onSuccess,
    redirectTo,
    router,
  ]);

  return actionState;
}
