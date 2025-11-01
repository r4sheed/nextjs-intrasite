import { AppError } from '@/lib/errors';

import type {
  ErrorResponse,
  Message,
  PartialError,
  PartialResponse,
  SuccessResponse,
} from './types';
import { Status } from './types';

type SuccessOptions<TData> = Readonly<{
  data?: TData;
  message?: Message;
}>;

type PartialOptions<TData> = Readonly<{
  data: TData;
  errors: ReadonlyArray<PartialError>;
  message?: Message;
}>;

const createSuccess = <TData>(
  options: SuccessOptions<TData> = {}
): SuccessResponse<TData> =>
  ({
    status: Status.Success,
    ...(options.data !== undefined ? { data: options.data } : {}),
    ...(options.message && { message: options.message }),
  }) satisfies SuccessResponse<TData>;

const createFailure = (error: AppError): ErrorResponse =>
  ({
    status: Status.Error,
    ...(error.errorMessage ? { message: error.errorMessage } : {}),
    code: error.code,
    httpStatus: error.httpStatus,
    ...(error.details !== undefined ? { details: error.details } : {}),
  }) satisfies ErrorResponse;

const createPartial = <TData>(
  options: PartialOptions<TData>
): PartialResponse<TData> =>
  ({
    status: Status.Partial,
    data: options.data,
    errors: options.errors.map<PartialError>(partialError => ({
      code: partialError.code,
      message: partialError.message,
      details: partialError.details,
    })),
    ...(options.message && { message: options.message }),
  }) satisfies PartialResponse<TData>;

type ResponseFactories = Readonly<{
  success: typeof createSuccess;
  failure: typeof createFailure;
  partial: typeof createPartial;
}>;

export const response: ResponseFactories = Object.freeze({
  success: createSuccess,
  failure: createFailure,
  partial: createPartial,
});
