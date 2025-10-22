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
  execute: (action: () => Promise<Response<TData>>) => Promise<Response<TData>>;
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
      action: () => Promise<Response<TData>>
    ): Promise<Response<TData>> => {
      // Set immediate pending state (urgent update)
      setStatus(Status.Pending);
      setMessage({});
      setData(undefined);
      setActionResponse(undefined);

      let response: Response<TData>;
      try {
        // Await the server action itself
        response = await action();
      } catch (err: unknown) {
        // Handle unexpected runtime errors during action execution
        console.error('useAction: Uncaught error during action execution', err);
        const errorMsg = 'An unexpected error occurred. Please try again.';

        // Construct a generic error response
        response = {
          status: Status.Error,
          message: errorMsg,
          code: ERROR_CODES.UNCAUGHT_EXCEPTION,
          httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        } as ErrorResponse; // We know this matches ErrorResponse

        // Update state within a transition
        startTransition(() => {
          setStatus(Status.Error);
          setMessage({ error: errorMsg });
          setActionResponse(response);
        });

        // Return the constructed error response
        return response;
      }

      // Handle the server's response and update state (non-urgent)
      startTransition(() => {
        setActionResponse(response); // Store for debugging

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

          // --- BUG FIX ---
          // Handle non-terminal states. A server action should NEVER return
          // 'pending' or 'idle'. If it does, it's an error.
          case Status.Pending:
          case Status.Idle:
            console.warn(
              `useAction: Received a non-terminal status '${response.status}' from a server action. This is likely a bug in the action.`
            );
            setMessage({
              error: 'Received an invalid response state from the server.',
            });
            setStatus(Status.Error); // Treat this as an error
            break;

          // Default case to catch any unhandled enum values
          default:
            console.error(`useAction: Unhandled response status:`, response);
            setMessage({ error: 'An unknown response status was received.' });
            setStatus(Status.Error);
            break;
        }
      });

      // Return the raw response so the caller can inspect it
      return response;
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
