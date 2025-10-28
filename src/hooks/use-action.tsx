import {
  PartialResponse,
  Response,
  SuccessResponse,
  isError,
} from '@/lib/result';

export async function execute<TData, TArgs>(
  action: (args: TArgs) => Promise<Response<TData>>,
  args: TArgs
): Promise<SuccessResponse<TData> | PartialResponse<TData>> {
  const result = await action(args);

  if (isError(result)) {
    throw result;
  }

  return result;
}
