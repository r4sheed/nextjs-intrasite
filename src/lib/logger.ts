/**
 * Centralized logging utility for the application.
 *
 * Provides a consistent interface for logging across all layers of the application.
 * In development, logs to console. In production, can be extended to send logs to
 * monitoring services like Sentry, LogRocket, or DataDog.
 *
 * @remarks
 * Use this logger instead of console.log/error/warn throughout the codebase.
 * This allows for centralized log management and easier integration with
 * external monitoring services.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Log an informational message.
 *
 * @param message - The log message
 * @param context - Optional context object with additional data
 */
function info(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[INFO] ${message}`, context || '');
  }
  // Production: send to monitoring service (e.g., Sentry, LogRocket, DataDog)
}

/**
 * Log a warning message.
 *
 * @param message - The warning message
 * @param context - Optional context object with additional data
 */
function warn(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[WARN] ${message}`, context || '');
  }
  // Production: send to monitoring service
}

/**
 * Log an error message.
 *
 * @param message - The error message
 * @param error - Optional error object
 * @param context - Optional context object with additional data
 */
function error(message: string, error?: unknown, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${message}`, { error, ...context });
  }
  // Production: send to error tracking service (e.g., Sentry)
}

/**
 * Log a debug message (only in development).
 *
 * @param message - The debug message
 * @param context - Optional context object with additional data
 */
function debug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DEBUG] ${message}`, context || '');
  }
}

/**
 * Centralized logger instance.
 *
 * Use this throughout the application instead of direct console calls.
 */
export const logger = {
  info,
  warn,
  error,
  debug,
} as const;
