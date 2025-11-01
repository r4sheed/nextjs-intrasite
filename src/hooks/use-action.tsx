import { ErrorResponse, isFailure, Response } from '@/lib/response';

export async function execute<TArgs, TResponse extends Response<unknown>>(
  action: (args: TArgs) => Promise<TResponse>,
  args: TArgs
): Promise<Exclude<TResponse, ErrorResponse>> {
  const result = await action(args);

  if (isFailure(result)) {
    throw result;
  }

  return result as Exclude<TResponse, ErrorResponse>;
}
