/**
 * Unified Response Pattern for Server Actions
 * All server actions must return Response<T>
 */
import { AppError } from '@/lib/errors';

/**
 * Status types for server responses
 */
export enum Status {
  Success = 'success',
  Error = 'error',
  Partial = 'partial',
}

/**
 * Message type for i18n support
 * Can be a simple string or an i18n key with optional parameters
 */
export type Message = { key: string; params?: Record<string, unknown> };

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
  | SuccessResponse<TData>
  | ErrorResponse
  | PartialResponse<TData>;

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
export function success<TData>(options: {
  data: TData;
  message?: Message;
}): SuccessResponse<TData> {
  return {
    status: Status.Success,
    data: options.data,
    ...(options.message && { message: options.message }),
  } as const;
}

/**
 * Create an error response from an AppError
 * @param error - Instance of AppError
 * @returns {ErrorResponse}
 * @example
 * const errorResponse = error(new AppError('INVALID_CREDENTIALS', 401, 'Invalid credentials'));
 */
export function error(error: AppError): ErrorResponse {
  return {
    status: Status.Error,
    message: error.errorMessage,
    code: error.code,
    httpStatus: error.httpStatus,
    details: error.details,
  } as const;
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
export function partial<TData>(options: {
  data: TData;
  errors: PartialError[];
  message?: Message;
}): PartialResponse<TData> {
  return {
    status: Status.Partial,
    data: options.data,
    errors: options.errors,
    ...(options.message && { message: options.message }),
  } as const;
}

/**
 * Convenience object containing all response factory functions
 * @example
 * import { response } from '@/lib/response';
 * return response.success(data);
 */
export const response = {
  success,
  error,
  partial,
};

/**
 * Type guards for response types
 */
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

export function isPartial<TData>(
  response: Response<TData>
): response is PartialResponse<TData> {
  return response.status === Status.Partial;
}

/**
 * Status helper functions
 */
export const isStatusSuccess = (status: Status) => status === Status.Success;
export const isStatusError = (status: Status) => status === Status.Error;
export const isStatusPartial = (status: Status) => status === Status.Partial;

/**
 * Serializes a Response to a plain object for JSON responses
 * Useful for API responses where complex types need to be flattened
 * @param response - The response to serialize
 * @returns Plain object representation
 */
export function serializeResponse<TData>(response: Response<TData>) {
  switch (response.status) {
    case Status.Success:
      return {
        status: response.status,
        data: response.data,
        message: response.message,
      };
    case Status.Error:
      return {
        status: response.status,
        message: response.message,
        code: response.code,
        httpStatus: response.httpStatus,
        details: response.details,
      };
    case Status.Partial:
      return {
        status: response.status,
        data: response.data,
        message: response.message,
        errors: response.errors.map(error => ({
          code: error.code,
          message: error.message,
          details: error.details,
        })),
      };
    default:
      // This should never happen due to discriminated union
      throw new Error(`Unknown response status: ${(response as any).status}`);
  }
}

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
