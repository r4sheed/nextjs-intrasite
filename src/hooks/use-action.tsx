'use client';

import { useCallback, useState, useTransition } from 'react';

import { ERROR_CODES } from '@/lib/errors/codes';
import { HTTP_STATUS } from '@/lib/http-status';
import type { ErrorResponse, Response } from '@/lib/response';
import { Status, getMessage } from '@/lib/response';

/**
 * Represents the state of the message, holding either a success or error string.
 */
interface MessageState {
  success?: string;
  error?: string;
}

/**
 * Represents the return value of the useAction hook.
 */
interface UseActionResult<TData> {
  /**
   * Executes the server action.
   * @param action A function that returns a Promise resolving to a server Response.
   * @returns A Promise that resolves with the server's Response object.
   */
  execute: (
    action: () => Promise<Response<TData>>,
    callbacks?: {
      onSuccess?: (res: Response<TData>) => void;
      onError?: (res: Response<TData>) => void;
    }
  ) => Promise<Response<TData>>;
  /**
   * Resets the hook's state to Idle.
   */
  reset: () => void;
  /**
   * The current status of the action (e.g., 'pending', 'success', 'error').
   */
  status: Status;
  /**
   * An object containing success or error messages derived from the response.
   */
  message: MessageState;
  /**
   * The data payload from a 'success' or 'partial' response.
   */
  data: TData | undefined;
  /**
   * A boolean indicating if the action is currently in progress.
   * True if status is 'pending' or a transition is active.
   */
  isPending: boolean;
  /**
   * Debugging object.
   * @property actionResponse - The last complete Response object received from the server.
   */
  debug: {
    actionResponse: Response<TData> | undefined;
  };
}

/**
 * A global React hook for handling server actions that follow the Response<T> pattern.
 * It manages loading states, success/error messages, and returned data.
 *
 * @template TData The type of data expected in a SuccessResponse or PartialResponse.
 * @returns {UseActionResult<TData>} An object containing state and functions to execute actions.
 *
 * @example
 * const { execute, status, message, data, isPending } = useAction<MyDataType>();
 *
 * const handleSubmit = async () => {
 * const response = await execute(() => myServerAction(formData));
 *
 * // You can now inspect the response directly
 * if (isSuccess(response)) {
 * console.log('Action succeeded:', response.data);
 * }
 * };
 *
 * if (isPending) return <Spinner />;
 * if (message.error) return <ErrorAlert message={message.error} />;
 * // ...
 */
export function useAction<TData>(): UseActionResult<TData> {
  // Optional hook-level callbacks can be supplied to react to responses
  // (useful for redirect logic, notifications, etc.). We intentionally
  // keep navigation out of this hook; callers pass callbacks that may
  // perform routing or other side-effects.
  // NOTE: This parameter is optional for backward compatibility.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function _noop() {}

  // We support passing hook-level callbacks via closure. For now we keep
  // the default empty behavior; callers can wrap useAction to
  // provide onSuccess/onError behavior.
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [message, setMessage] = useState<MessageState>({});
  const [data, setData] = useState<TData | undefined>(undefined);
  const [actionResponse, setActionResponse] = useState<
    Response<TData> | undefined
  >();
  const [isTransitionPending, startTransition] = useTransition();

  /**
   * Resets all state back to its initial (Idle) values.
   */
  const reset = useCallback(() => {
    setStatus(Status.Idle);
    setMessage({});
    setData(undefined);
    setActionResponse(undefined);
  }, []);

  /**
   * Executes the provided server action, awaits its result,
   * and updates the hook's state accordingly.
   * State updates are wrapped in a React transition.
   */
  const execute = useCallback(
    async (
      action: () => Promise<Response<TData>>,
      callbacks?: {
        onSuccess?: (res: Response<TData>) => void;
        onError?: (res: Response<TData>) => void;
      }
    ): Promise<Response<TData>> => {
      // Set immediate pending state (urgent update)
      setStatus(Status.Pending);
      setMessage({});
      setData(undefined);
      setActionResponse(undefined);

      // IMPORTANT NOTE
      // We'll return a promise that resolves when the transition's async
      // work (the action + state updates) completes. Wrapping the entire
      // action inside startTransition preserves the previous behavior
      // where `isTransitionPending` stays true for the full duration of
      // the server call and state commits, preventing brief UI re-activation
      // before side-effects (like navigation) occur.
      return await new Promise<Response<TData>>(resolve => {
        startTransition(async () => {
          let response: Response<TData>;

          try {
            response = await action();
          } catch (err: unknown) {
            console.error(
              'useAction: Uncaught error during action execution',
              err
            );
            const errorMsg = 'An unexpected error occurred. Please try again.';

            response = {
              status: Status.Error,
              message: errorMsg,
              code: ERROR_CODES.UNCAUGHT_EXCEPTION,
              httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            } as ErrorResponse;

            // Update state as error
            setStatus(Status.Error);
            setMessage({ error: errorMsg });
            setActionResponse(response);

            // Invoke per-call error callback if provided
            try {
              callbacks?.onError?.(response);
            } catch (cbErr) {
              console.error('useAction: onError callback threw', cbErr);
            }

            resolve(response);
            return;
          }

          // Normal response handling
          setActionResponse(response);

          // Invoke any per-call or hook-level callbacks after state updates
          // (these are non-blocking and optional)

          switch (response.status) {
            case Status.Success:
              setData(response.data);
              setMessage({ success: getMessage(response.message) });
              setStatus(response.status);
              break;

            case Status.Error:
              setMessage({ error: getMessage(response.message) });
              setStatus(response.status);
              break;

            case Status.Partial:
              setData(response.data);
              const partialError =
                response.errors.length > 0
                  ? getMessage(response.errors[0].message)
                  : undefined;
              setMessage({
                success: getMessage(response.message),
                error: partialError,
              });
              setStatus(response.status);
              break;

            case Status.Pending:
            case Status.Idle:
              console.warn(
                `useAction: Received a non-terminal status '${response.status}' from a server action. This is likely a bug in the action.`
              );
              setMessage({
                error: 'Received an invalid response state from the server.',
              });
              setStatus(Status.Error);
              break;

            default:
              console.error(`useAction: Unhandled response status:`, response);
              setMessage({ error: 'An unknown response status was received.' });
              setStatus(Status.Error);
              break;
          }

          // Callbacks are invoked after state updates to avoid race with
          // local component effects. We try to call per-call callbacks
          // passed via the second argument of `execute` (if any).
          try {
            if (response.status === Status.Success) {
              callbacks?.onSuccess?.(response);
            } else if (response.status === Status.Error) {
              callbacks?.onError?.(response);
            }
          } catch (cbErr) {
            console.error('useAction: callback threw', cbErr);
          }

          resolve(response);
        });
      });
    },
    [] // `startTransition` is stable and not needed as a dependency
  );

  return {
    execute,
    reset,
    status,
    message,
    data,
    // The action is pending if its status is Pending OR a state transition is active
    isPending: status === Status.Pending || isTransitionPending,
    debug: {
      actionResponse,
    },
  };
}
