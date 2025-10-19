import { useState, useTransition } from 'react';

import { toast } from 'sonner';

import { type Response, Status } from '@/lib/response';

interface UseApiResponseOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: {
    code: string;
    message: string;
    details?: unknown;
  }) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  /** Function to translate i18n keys */
  translate?: (key: string, params?: Record<string, unknown>) => string;
}

/**
 * Reusable hook for handling API response states
 * Eliminates boilerplate code across forms and components
 */
export function useApiResponse<TData>(
  options: UseApiResponseOptions<TData> = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<{
    code: string;
    message: string;
    details?: unknown;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage,
    translate = (key: string) => key, // Default to key if no translation function
  } = options;

  async function execute<TResult = TData>(
    action: () => Promise<Response<TResult>>
  ): Promise<Response<TResult>> {
    setError(null);

    return new Promise(resolve => {
      startTransition(async () => {
        const response = await action();

        switch (response.status) {
          case Status.Success:
            setData(response.data as unknown as TData);

            if (showSuccessToast) {
              toast.success(successMessage || 'Success');
            }

            onSuccess?.(response.data as unknown as TData);
            break;

          case Status.Error: {
            const errorMessage =
              typeof response.error.message === 'string'
                ? response.error.message
                : translate(
                    response.error.message.key,
                    response.error.message.params
                  );

            const errorObj = {
              code: response.error.code,
              message: errorMessage,
              details: response.error.details,
            };

            setError(errorObj);

            if (showErrorToast) {
              toast.error(errorMessage);
            }

            onError?.(errorObj);
            break;
          }

          case Status.Partial:
            setData(response.data as unknown as TData);

            if (response.errors && response.errors.length > 0) {
              const firstError = response.errors[0];
              const partialErrorMessage =
                typeof firstError.message === 'string'
                  ? firstError.message
                  : translate(
                      firstError.message.key,
                      firstError.message.params
                    );

              if (showErrorToast) {
                toast.warning(partialErrorMessage);
              }
            }
            break;

          case Status.Pending:
            // Handle pending if needed
            break;
        }

        resolve(response);
      });
    });
  }

  function reset() {
    setData(null);
    setError(null);
  }

  return {
    data,
    error,
    isPending,
    execute,
    reset,
  };
}
