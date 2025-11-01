import { Status } from './types';
import type {
  ErrorResponse,
  PartialResponse,
  Response,
  SuccessResponse,
} from './types';

export const isSuccess = <TData>(
  response: Response<TData>
): response is SuccessResponse<TData> => response.status === Status.Success;

export const isFailure = <TData>(
  response: Response<TData>
): response is ErrorResponse => response.status === Status.Error;

export const isPartial = <TData>(
  response: Response<TData>
): response is PartialResponse<TData> => response.status === Status.Partial;
