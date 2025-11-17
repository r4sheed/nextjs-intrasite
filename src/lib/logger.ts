import pino from 'pino';

import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';

/**
 * Valid log levels supported by Pino.
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
 * Builds the Pino logger configuration depending on the environment.
 */
const getLoggerConfig = (): pino.LoggerOptions => {
  const isDevelopment = env.NODE_ENV === 'development';
  const isTest = env.NODE_ENV === 'test';

  const baseConfig: pino.LoggerOptions = {
    level: env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

    /**
     * Adds metadata fields to every log entry.
     */
    mixin() {
      return {
        environment: env.NODE_ENV,
        service: env.APP_NAME,
        version: env.APP_VERSION,
      };
    },

    /**
     * Removes or masks sensitive information from logs.
     */
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'token',
        '*.password',
        '*.token',
        'accessToken',
        'refreshToken',
        'sessionToken',
        'apiKey',
        'secret',
        'privateKey',
      ],
      censor: '[REDACTED]',
      remove: false,
    },

    /**
     * Serializers for complex objects.
     */
    serializers: {
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  };

  if (isDevelopment) {
    return {
      ...baseConfig,
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: baseConfig.level,
            options: {
              colorize: true,
              singleLine: false,
              ignore: 'pid,hostname',
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            },
          },
        ],
      },
    };
  }

  if (isTest) {
    return {
      ...baseConfig,
      level: 'silent',
    };
  }

  return {
    ...baseConfig,
    timestamp: pino.stdTimeFunctions.isoTime,
  };
};

/**
 * Root logger instance used internally for all child loggers.
 */
const rootLogger = pino(getLoggerConfig());

/**
 * Extracts log context from an Error instance.
 * Handles both standard Errors and AppErrors with additional metadata.
 */
const getErrorContext = (error: Error) => {
  const isAppError = error instanceof AppError;

  return {
    err: error,
    ...(isAppError && {
      code: error.code,
      httpStatus: error.httpStatus,
      details: error.details,
      errorMessage: error.errorMessage,
    }),
  };
};

/**
 * Gets the appropriate message string from an Error instance.
 */
const getErrorMessage = (error: Error): string => {
  return error instanceof AppError ? error.errorMessage.key : error.message;
};

/**
 * Type definition for log methods with overloaded signatures.
 */
type LogMethod = {
  (message: string): void;
  (context: Record<string, unknown>, message?: string): void;
  (error: Error, message?: string): void;
};

/**
 * Factory function to create log methods with unified logic.
 * Handles three signatures: string, object with optional message, or Error with optional message.
 */
const createLogMethod =
  (level: pino.Level): LogMethod =>
  (arg1: string | Record<string, unknown> | Error, arg2?: string) => {
    if (typeof arg1 === 'string') {
      return rootLogger[level](arg1);
    }

    if (arg1 instanceof Error) {
      const context = getErrorContext(arg1);
      const message = arg2 ?? getErrorMessage(arg1);
      return rootLogger[level](context, message);
    }

    return arg2 ? rootLogger[level](arg1, arg2) : rootLogger[level](arg1);
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

/**
 * Application logging utility with support for structured logging,
 * error handling, and module-specific child loggers.
 *
 * @example
 * // Simple message
 * logger.info('User logged in');
 *
 * @example
 * // With context
 * logger.info({ userId: '123' }, 'User logged in');
 *
 * @example
 * // With Error
 * logger.error(error, 'Failed to process request');
 *
 * @example
 * // Child logger for specific module
 * const authLogger = logger.forAuth();
 * authLogger.info('Authentication successful');
 */
export const logger = {
  /**
   * Log at debug level.
   * Use for detailed diagnostic information during development.
   */
  debug: createLogMethod('debug'),

  /**
   * Log at info level.
   * Use for general informational messages about application flow.
   */
  info: createLogMethod('info'),

  /**
   * Log at warn level.
   * Use for warning messages about potentially harmful situations.
   */
  warn: createLogMethod('warn'),

  /**
   * Log at error level.
   * Use for error events that might still allow the application to continue.
   */
  error: createLogMethod('error'),

  /**
   * Log at fatal level.
   * Use for severe errors that will lead the application to abort.
   */
  fatal: createLogMethod('fatal'),

  /**
   * Creates a child logger with additional context.
   * @param context - Context object to be included in all logs from this child.
   */
  child: (context: Record<string, unknown>) => rootLogger.child(context),

  /**
   * Creates a child logger for a specific module.
   * @param moduleName - Name of the module (can be predefined or custom).
   */
  forModule: (moduleName: LogModule | string) =>
    rootLogger.child({ module: moduleName }),

  /**
   * Creates a child logger for authentication operations.
   */
  forAuth: () => rootLogger.child({ module: logModules.auth }),

  /**
   * Creates a child logger for database operations.
   */
  forDatabase: () => rootLogger.child({ module: logModules.database }),

  /**
   * Creates a child logger for HTTP request handling.
   * @param requestId - Unique identifier for the request.
   * @param moduleName - Optional module name (defaults to 'http').
   */
  forRequest: (requestId: string, moduleName: LogModule = logModules.http) =>
    rootLogger.child({ requestId, module: moduleName }),

  /**
   * Creates a child logger for analytics operations.
   */
  forAnalytics: () => rootLogger.child({ module: logModules.analytics }),

  /**
   * Creates a child logger for mail operations.
   */
  forMail: () => rootLogger.child({ module: logModules.mail }),

  /**
   * Creates a child logger for UI operations.
   */
  forUI: () => rootLogger.child({ module: logModules.ui }),
};
