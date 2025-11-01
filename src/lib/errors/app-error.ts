import { HTTP_STATUS, type HttpStatusCode } from '@/lib/http-status';
import { Message } from '@/lib/response';

interface AppErrorParams {
  code: string;
  message: Message;
  httpStatus?: HttpStatusCode;
  details?: unknown;
}

/**
 * AppError class for structured error handling
 * Use object-based constructor for future-proof extensibility
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly errorMessage: Message; // Message type with i18n support
  public readonly httpStatus: HttpStatusCode;
  public readonly details?: unknown;

  constructor({
    code,
    message,
    httpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details,
  }: AppErrorParams) {
    // Call Error constructor with string representation for stack traces
    super(message.key);
    this.code = code;
    this.errorMessage = message; // Store full Message type (string or i18n object)
    this.httpStatus = httpStatus;
    this.details = details;

    // Maintains correct stack trace
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes the error to a plain object for JSON responses
   * Useful for API responses where the full Error object can't be sent
   */
  toJSON() {
    return {
      code: this.code,
      message: this.errorMessage,
      httpStatus: this.httpStatus,
      details: this.details,
    };
  }
}
