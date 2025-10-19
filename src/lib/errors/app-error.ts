import { HTTP_STATUS, type HttpStatusCode } from '@/lib/http-status';

interface AppErrorParams {
  code: string;
  message: string | { key: string; params?: Record<string, unknown> };
  httpStatus?: HttpStatusCode;
  details?: unknown;
}

/**
 * AppError class for structured error handling
 * Use object-based constructor for future-proof extensibility
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly i18nMessage:
    | string
    | { key: string; params?: Record<string, unknown> };
  public readonly httpStatus: HttpStatusCode;
  public readonly details?: unknown;

  constructor({
    code,
    message,
    httpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details,
  }: AppErrorParams) {
    super(typeof message === 'string' ? message : message.key);
    this.code = code;
    this.i18nMessage = message;
    this.httpStatus = httpStatus;
    this.details = details;

    // Maintains correct stack trace
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
