import pino from 'pino';

import { env } from '@/lib/env';

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

    /**
     * Allows custom preprocessing of log calls.
     */
    hooks: {
      logMethod(inputArgs, method) {
        // inputArgs: [object, msg?]
        if (
          typeof inputArgs[1] === 'string' &&
          typeof inputArgs[0] === 'object'
        ) {
          inputArgs[0] = { ...inputArgs[0], logEvent: inputArgs[1] };
        }
        method.apply(this, inputArgs);
      },
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
      level: 'error',
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: 'error',
            options: {
              colorize: false,
              singleLine: true,
              ignore: 'pid,hostname,time',
            },
          },
        ],
      },
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
 * Predefined logging modules.
 */
export const LOG_MODULES = {
  AUTH: 'auth',
  DATABASE: 'database',
  HTTP: 'http',
  ANALYTICS: 'analytics',
  MAIL: 'mail',
  UI: 'ui',
} as const;

export type LogModule = (typeof LOG_MODULES)[keyof typeof LOG_MODULES];

/**
 * Application logging utility.
 */
export const logger = {
  debug(context: Record<string, unknown>, message?: string) {
    return message
      ? rootLogger.debug(context, message)
      : rootLogger.debug(context);
  },

  info(context: Record<string, unknown>, message?: string) {
    return message
      ? rootLogger.info(context, message)
      : rootLogger.info(context);
  },

  warn(context: Record<string, unknown>, message?: string) {
    return message
      ? rootLogger.warn(context, message)
      : rootLogger.warn(context);
  },

  error(context: Record<string, unknown>, message?: string) {
    return message
      ? rootLogger.error(context, message)
      : rootLogger.error(context);
  },

  fatal(context: Record<string, unknown>, message?: string) {
    return message
      ? rootLogger.fatal(context, message)
      : rootLogger.fatal(context);
  },

  child(context: Record<string, unknown>) {
    return rootLogger.child(context);
  },

  forModule(moduleName: LogModule | string) {
    return rootLogger.child({ module: moduleName });
  },

  forRequest(requestId: string) {
    return rootLogger.child({ requestId, module: LOG_MODULES.HTTP });
  },

  forDatabase() {
    return rootLogger.child({ module: LOG_MODULES.DATABASE });
  },

  forAuth() {
    return rootLogger.child({ module: LOG_MODULES.AUTH });
  },

  forAnalytics() {
    return rootLogger.child({ module: LOG_MODULES.ANALYTICS });
  },
};
