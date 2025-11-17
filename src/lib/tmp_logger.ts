import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';

/**
 * Valid log levels supported by the API.
 */
export type LogLevel =
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'trace'
  | 'silent';

/**
 * Type definition for log methods with overloaded signatures.
 */
type LogMethod = {
  (message: string): void;
  (context: Record<string, unknown>, message?: string): void;
  (error: Error, message?: string): void;
};

/**
 * Predefined logging modules for consistent categorization.
 */
export const logModules = {
  auth: 'auth',
  database: 'database',
  http: 'http',
  analytics: 'analytics',
  mail: 'mail',
  ui: 'ui',
} as const;

export type LogModule = (typeof logModules)[keyof typeof logModules];

// ------------------------------------------------------------------
// CONSOLE IMPLEMENTATION (NO PINO)
// ------------------------------------------------------------------

/**
 * Factory function to create console log methods with unified API handling.
 * This ensures the logger accepts (msg), (context, msg), or (error, msg) signatures.
 */
const createConsoleMethod =
  (level: 'debug' | 'log' | 'warn' | 'error'): LogMethod =>
  (arg1: any, arg2?: any) => {
    const isoString = new Date().toISOString();
    const timePart = isoString.split('T')[1];
    const time = timePart ? timePart.slice(0, 8) : '00:00:00';
    const consoleMethod = level === 'log' ? 'info' : level;

    // 1. If Error is the first argument
    if (arg1 instanceof Error) {
      const message =
        arg2 ??
        (arg1 instanceof AppError ? arg1.errorMessage.key : arg1.message);
      // Logs the message and the full error object
      console[consoleMethod](
        `[${time}][${level.toUpperCase()}][ERROR] ${message}`,
        arg1
      );
      return;
    }

    // 2. If object/context is the first argument
    if (typeof arg1 === 'object' && arg1 !== null) {
      const message = arg2 ?? '';
      // Logs the message and the context object
      console[consoleMethod](
        `[${time}][${level.toUpperCase()}] ${message}`,
        arg1
      );
      return;
    }

    // 3. Simple string message
    console[consoleMethod](`[${time}][${level.toUpperCase()}] ${arg1}`);
  };

/**
 * Temporary Application logging utility using native console methods.
 * All child methods return the main logger object to maintain chaining compatibility.
 */
export const logger = {
  /** Log at debug level. */
  debug: createConsoleMethod('debug'),
  /** Log at info level. */
  info: createConsoleMethod('log'),
  /** Log at warn level. */
  warn: createConsoleMethod('warn'),
  /** Log at error level. */
  error: createConsoleMethod('error'),
  /** Log at fatal level (treated as error). */
  fatal: createConsoleMethod('error'),

  // --- Child and Module methods (return logger to maintain chaining) ---

  /** Creates a child logger with additional context. */
  child: (_context: Record<string, unknown>) => logger,

  /** Creates a child logger for a specific module. */
  forModule: (_moduleName: LogModule | string) => logger,

  /** Creates a child logger for authentication operations. */
  forAuth: () => logger,

  /** Creates a child logger for database operations. */
  forDatabase: () => logger,

  /** Creates a child logger for HTTP request handling. */
  forRequest: (_requestId: string, _moduleName: LogModule = logModules.http) =>
    logger,

  /** Creates a child logger for analytics operations. */
  forAnalytics: () => logger,

  /** Creates a child logger for mail operations. */
  forMail: () => logger,

  /** Creates a child logger for UI operations. */
  forUI: () => logger,
};
