/**
 * Unified Response Pattern for Server Actions
 * All server actions must return Response<T>
 */
import { AppError } from '@/lib/errors/app-error';

export enum Status {
  Success = 'success',
  Error = 'error',
  Pending = 'pending',
  Partial = 'partial',
}

export interface ErrorResponse {
  status: Status.Error;
  error: AppError;
}

export interface SuccessResponse<TData> {
  status: Status.Success;
  data: TData;
}

export interface PartialError {
  code: string;
  message: string | { key: string; params?: Record<string, unknown> };
  details?: unknown;
}

export interface PartialResponse<TData> {
  status: Status.Partial;
  data: TData;
  errors?: PartialError[];
}

export interface PendingResponse {
  status: Status.Pending;
}

export type Response<TData> =
  | SuccessResponse<TData>
  | ErrorResponse
  | PartialResponse<TData>
  | PendingResponse;

/**
 * Helper function to create a success response
 */
export function success<TData>(data: TData): SuccessResponse<TData> {
  return {
    status: Status.Success,
    data,
  };
}

/**
 * Helper function to create an error response
 */
export function failure(error: AppError): ErrorResponse {
  return {
    status: Status.Error,
    error,
  };
}

/**
 * Helper function to create a partial response
 */
export function partial<TData>(
  data: TData,
  errors?: PartialError[]
): PartialResponse<TData> {
  return {
    status: Status.Partial,
    data,
    errors,
  };
}

/**
 * Helper function to create a pending response
 */
export function pending(): PendingResponse {
  return {
    status: Status.Pending,
  };
}
