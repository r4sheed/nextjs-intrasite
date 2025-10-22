export const HTTP_STATUS = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  TOO_MANY_REQUESTS: 429,
  UNPROCESSABLE_ENTITY: 422,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// Create a Set for O(1) average time complexity lookup, improving performance
const HTTP_STATUS_CODES_SET = new Set(Object.values(HTTP_STATUS));

/**
 * Type guard to check if a value is one of the defined HTTP status codes.
 */
export function isHttpStatusCode(value: unknown): value is HttpStatusCode {
  return (
    typeof value === 'number' &&
    HTTP_STATUS_CODES_SET.has(value as HttpStatusCode)
  );
}

/**
 * Checks if a status code is in the 2xx (Success) range.
 */
export function isSuccess(code: number): boolean {
  return code >= 200 && code <= 299;
}

/**
 * Checks if a status code is in the 3xx (Redirection) range.
 */
export function isRedirection(code: number): boolean {
  return code >= 300 && code <= 399;
}

/**
 * Checks if a status code is in the 4xx (Client Error) range.
 */
export function isClientError(code: number): boolean {
  return code >= 400 && code <= 499;
}

/**
 * Checks if a status code is in the 5xx (Server Error) range.
 */
export function isServerError(code: number): boolean {
  return code >= 500 && code <= 599;
}

/**
 * Checks if a status code represents an error (4xx or 5xx).
 */
export function isError(code: number): boolean {
  return isClientError(code) || isServerError(code);
}
