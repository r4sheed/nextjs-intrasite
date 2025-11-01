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
 */
export type Message = Readonly<{
  key: string;
  params?: Record<string, unknown>;
}>;

export type SuccessResponse<TData> = Readonly<{
  status: Status.Success;
  data?: TData;
  message?: Message;
}>;

export type ErrorResponse = Readonly<{
  status: Status.Error;
  message?: Message;
  code: string;
  httpStatus: number;
  details?: unknown;
}>;

export type PartialError = Readonly<{
  code: string;
  message: Message;
  details?: unknown;
}>;

export type PartialResponse<TData> = Readonly<{
  status: Status.Partial;
  data: TData;
  message?: Message;
  errors: ReadonlyArray<PartialError>;
}>;

export type Response<TData> =
  | SuccessResponse<TData>
  | ErrorResponse
  | PartialResponse<TData>;

export type ActionSuccess<
  TAction extends (...args: any[]) => Promise<Response<unknown>>,
> = Exclude<Awaited<ReturnType<TAction>>, ErrorResponse>;

export type ActionFailure<
  TAction extends (...args: any[]) => Promise<Response<unknown>>,
> = Extract<Awaited<ReturnType<TAction>>, ErrorResponse>;

export type InferActionArgs<
  TAction extends (...args: any[]) => Promise<Response<unknown>>,
> = Parameters<TAction>[0];

export type InferActionData<
  TAction extends (...args: any[]) => Promise<Response<unknown>>,
> =
  ActionSuccess<TAction> extends SuccessResponse<infer TData>
    ? TData
    : ActionSuccess<TAction> extends PartialResponse<infer TPartial>
      ? TPartial
      : never;

export type InferPartialErrors<
  TAction extends (...args: any[]) => Promise<Response<unknown>>,
> =
  ActionSuccess<TAction> extends PartialResponse<unknown>
    ? ActionSuccess<TAction>['errors']
    : never;
