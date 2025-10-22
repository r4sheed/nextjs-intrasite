/**
 * Unified Response Pattern for Server Actions
 * All server actions must return Response<T>
 */
import { AppError } from '@/lib/errors/app-error';

export enum Status {
  Idle = 'idle',
  Success = 'success',
  Error = 'error',
  Pending = 'pending',
  Partial = 'partial',
}

/**
 * Message type for i18n support
 * Simple string or i18n key with params for formatted messages
 */
export type Message =
  | string
  | { key: string; params?: Record<string, unknown> };

/**
 * Idle response - initial state, no action performed yet
 */
export interface IdleResponse {
  status: Status.Idle;
}

/**
 * Success response - contains data and optional success message
 */
export interface SuccessResponse<TData> {
  status: Status.Success;
  data: TData;
  success?: Message;
}

/**
 * Error response - all error details directly on response
 * No nested objects, simple and clear
 */
export interface ErrorResponse {
  status: Status.Error;
  error: Message;
  code: string;
  httpStatus: number;
  details?: unknown;
}

/**
 * Pending response - operation in progress
 */
export interface PendingResponse {
  status: Status.Pending;
}

/**
 * Partial error type for batch operations
 */
export interface PartialError {
  code: string;
  error: Message;
  details?: unknown;
}

/**
 * Partial response - some operations succeeded, some failed
 */
export interface PartialResponse<TData> {
  status: Status.Partial;
  data: TData;
  success?: Message;
  errors: PartialError[];
}

export type Response<TData> =
  | IdleResponse
  | SuccessResponse<TData>
  | ErrorResponse
  | PendingResponse
  | PartialResponse<TData>;

/**
 * Create idle response
 */
export function idle(): IdleResponse {
  return {
    status: Status.Idle,
  } as const;
}

/**
 * Create success response
 * @param data - The response data
 * @param success - Optional success message (string or i18n key with params)
 *
 * @example
 * success({ userId: '123' })
 * success({ userId: '123' }, 'Registration successful')
 * success({ userId: '123' }, { key: 'auth.success.registered', params: { email: 'user@example.com' } })
 */
export function success<TData>(
  data: TData,
  success?: Message
): SuccessResponse<TData> {
  return {
    status: Status.Success,
    data,
    ...(success && { success }),
  } as const;
}

/**
 * Create error response from AppError
 * Automatically serializes AppError for client-server communication
 *
 * @example
 * failure(AuthErrors.INVALID_CREDENTIALS)
 */
export function failure(error: AppError): ErrorResponse {
  return {
    status: Status.Error,
    error: error.errorMessage,
    code: error.code,
    httpStatus: error.httpStatus,
    details: error.details,
  } as const;
}

/**
 * Create pending response
 */
export function pending(): PendingResponse {
  return {
    status: Status.Pending,
  } as const;
}

/**
 * Create partial response - some operations succeeded, some failed
 */
export function partial<TData>(
  data: TData,
  errors: PartialError[],
  success?: Message
): PartialResponse<TData> {
  return {
    status: Status.Partial,
    data,
    errors,
    ...(success && { success }),
  } as const;
}

/**
 * Type guard helpers
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
 * Note: This only extracts the key, actual i18n formatting happens in components
 */
export function getMessage(msg: Message | undefined): string | undefined {
  if (!msg) return undefined;
  return typeof msg === 'string' ? msg : msg.key;
}

/**
 * Format a Message with i18n support
 *
 * @param msg - The message to format (string or i18n object)
 * @param translator - Optional translation function from your i18n library
 * @returns Formatted string message
 *
 * @example
 * // Without i18n (returns plain string or key)
 * formatMessage('Simple error message')
 *
 * @example
 * // With next-intl
 * import { useTranslations } from 'next-intl';
 * const t = useTranslations();
 * formatMessage(response.error, t)
 *
 * @example
 * // With react-i18next
 * import { useTranslation } from 'react-i18next';
 * const { t } = useTranslation();
 * formatMessage(response.error, t)
 */
export function formatMessage(
  msg: Message | undefined,
  translator?: (key: string, params?: Record<string, unknown>) => string
): string | undefined {
  if (!msg) return undefined;

  // Simple string message
  if (typeof msg === 'string') {
    return msg;
  }

  // i18n object with key and params
  if (translator) {
    return translator(msg.key, msg.params);
  }

  // Fallback: return key if no translator provided
  return msg.key;
}
