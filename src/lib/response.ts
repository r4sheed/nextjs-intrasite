/**
 * Unified Response Pattern for Server Actions
 * All server actions must return Response<T>
 */
import { AppError } from '@/lib/errors';

/**
 * Status types for server responses
 */
export enum Status {
  Idle = 'idle',
  Success = 'success',
  Error = 'error',
  Pending = 'pending',
  Partial = 'partial',
}

/**
 * Message type for i18n support
 * Can be a simple string or an i18n key with optional parameters
 */
export type Message =
  | string
  | { key: string; params?: Record<string, unknown> };

/**
 * Response when no action has been performed yet
 */
export interface IdleResponse {
  status: Status.Idle;
}

/**
 * Response when an action is successful
 */
export interface SuccessResponse<TData> {
  status: Status.Success;
  data: TData;
  message?: Message;
}

/**
 * Response when an error occurs
 */
export interface ErrorResponse {
  status: Status.Error;
  message: Message;
  code: string;
  httpStatus: number;
  details?: unknown;
}

/**
 * Response when an operation is in progress
 */
export interface PendingResponse {
  status: Status.Pending;
}

/**
 * Represents an individual error in a partial operation
 */
export interface PartialError {
  code: string;
  message: Message;
  details?: unknown;
}

/**
 * Response when some operations succeed and some fail
 */
export interface PartialResponse<TData> {
  status: Status.Partial;
  data: TData;
  message?: Message;
  errors: PartialError[];
}

/**
 * Union type of all possible server responses
 */
export type Response<TData> =
  | IdleResponse
  | SuccessResponse<TData>
  | ErrorResponse
  | PendingResponse
  | PartialResponse<TData>;

/**
 * Create an idle response
 * @returns {IdleResponse}
 * @example
 * const response = idle();
 * // response => { status: 'idle' }
 */
export function idle(): IdleResponse {
  return { status: Status.Idle } as const;
}

/**
 * Create a success response
 * @param data - The response payload
 * @param message - Optional success message (string or i18n object)
 * @returns {SuccessResponse<TData>}
 * @example
 * success({ userId: '123' })
 * success({ userId: '123' }, 'Registration successful')
 * success({ userId: '123' }, { key: 'auth.success.registered', params: { email: 'user@example.com' } })
 */
export function success<TData>(
  data: TData,
  message?: Message
): SuccessResponse<TData> {
  return {
    status: Status.Success,
    data,
    ...(message && { message }),
  } as const;
}

/**
 * Create an error response from an AppError
 * @param error - Instance of AppError
 * @returns {ErrorResponse}
 * @example
 * const errorResponse = failure(new AppError('INVALID_CREDENTIALS', 401, 'Invalid credentials'));
 */
export function failure(error: AppError): ErrorResponse {
  return {
    status: Status.Error,
    message: error.errorMessage,
    code: error.code,
    httpStatus: error.httpStatus,
    details: error.details,
  } as const;
}

/**
 * Create a pending response
 * @returns {PendingResponse}
 * @example
 * const loading = pending();
 * // loading => { status: 'pending' }
 */
export function pending(): PendingResponse {
  return { status: Status.Pending } as const;
}

/**
 * Create a partial response - some operations succeeded, some failed
 * @param data - The successful data
 * @param errors - List of partial errors
 * @param message - Optional message
 * @returns {PartialResponse<TData>}
 * @example
 * const response = partial(
 *   [{ id: 1 }, { id: 2 }],
 *   [{ code: 'FAIL_3', message: 'Failed to process item 3' }]
 * );
 */
export function partial<TData>(
  data: TData,
  errors: PartialError[],
  message?: Message
): PartialResponse<TData> {
  return {
    status: Status.Partial,
    data,
    errors,
    ...(message && { message }),
  } as const;
}

/**
 * Type guards for response types
 */
export function isIdle<TData>(
  response: Response<TData>
): response is IdleResponse {
  return response.status === Status.Idle;
}

export function isSuccess<TData>(
  response: Response<TData>
): response is SuccessResponse<TData> {
  return response.status === Status.Success;
}

export function isError<TData>(
  response: Response<TData>
): response is ErrorResponse {
  return response.status === Status.Error;
}

export function isPending<TData>(
  response: Response<TData>
): response is PendingResponse {
  return response.status === Status.Pending;
}

export function isPartial<TData>(
  response: Response<TData>
): response is PartialResponse<TData> {
  return response.status === Status.Partial;
}

/**
 * Status helper functions
 */
export const isStatusIdle = (status: Status) => status === Status.Idle;
export const isStatusSuccess = (status: Status) => status === Status.Success;
export const isStatusError = (status: Status) => status === Status.Error;
export const isStatusPending = (status: Status) => status === Status.Pending;
export const isStatusPartial = (status: Status) => status === Status.Partial;

/**
 * Extract string from Message type (for display purposes)
 * @param msg - Message object or string
 * @returns string or undefined
 * @example
 * getMessage('Simple message') => 'Simple message'
 * getMessage({ key: 'auth.success', params: { email: 'a@b.com' }}) => 'auth.success'
 */
export function getMessage(msg: Message | undefined): string | undefined {
  if (!msg) return undefined;
  return typeof msg === 'string' ? msg : msg.key;
}

/**
 * Format a Message with i18n support
 * @param msg - Message to format
 * @param translator - Optional translation function from i18n library
 * @returns Formatted string
 * @example
 * formatMessage('Simple message') => 'Simple message'
 * formatMessage({ key: 'auth.success', params: { email: 'a@b.com' }}, t) => 'Registration successful for a@b.com'
 */
export function formatMessage(
  msg: Message | undefined,
  translator?: (key: string, params?: Record<string, unknown>) => string
): string | undefined {
  if (!msg) return undefined;

  if (typeof msg === 'string') return msg;

  if (translator) return translator(msg.key, msg.params);

  return msg.key;
}
