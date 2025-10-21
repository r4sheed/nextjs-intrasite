'use client';

import { useCallback, useState, useTransition } from 'react';

import type { Message, Response } from '@/lib/response';
import { Status, getMessage } from '@/lib/response';

/**
 * Global hook for handling server actions with Response<T> pattern
 * Returns structured success/error messages and status
 */
export function useAction<TData>() {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TData | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  /**
   * Execute a server action and handle its response
   */
  const execute = useCallback(
    async (action: () => Promise<Response<TData>>): Promise<void> => {
      setErrorMsg(undefined);
      setSuccessMsg(undefined);
      setStatus(Status.Pending);

      startTransition(async () => {
        try {
          const response = await action();

          switch (response.status) {
            case Status.Success:
              setData(response.data);
              setSuccessMsg(getMessage(response.success));
              setStatus(response.status); // Set status LAST
              break;

            case Status.Error:
              setErrorMsg(getMessage(response.error));
              setStatus(response.status); // Set status LAST
              break;

            case Status.Partial:
              setData(response.data);
              setSuccessMsg(getMessage(response.success));
              if (response.errors.length > 0) {
                setErrorMsg(getMessage(response.errors[0].error));
              }
              setStatus(response.status); // Set status LAST
              break;

            case Status.Pending:
              setStatus(response.status);
              break;
          }
        } catch (err) {
          setErrorMsg('An unexpected error occurred. Please try again.');
          setStatus(Status.Error); // Set status LAST
          console.error('useAction error:', err);
        }
      });
    },
    []
  );

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setStatus(Status.Idle);
    setSuccessMsg(undefined);
    setErrorMsg(undefined);
    setData(undefined);
  }, []);

  return {
    execute,
    reset,
    status,
    message: {
      success: successMsg,
      error: errorMsg,
    },
    data,
    isPending: status === Status.Pending || isPending,
  };
}
