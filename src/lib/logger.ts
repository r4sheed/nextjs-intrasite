import pino from 'pino';

import { env } from '@/lib/env';

/**
 * Logger configuration based on environment
 */
const getLoggerConfig = () => {
  const isDevelopment = env.NODE_ENV === 'development';
  const isTest = env.NODE_ENV === 'test';

  // Base configuration
  const baseConfig: pino.LoggerOptions = {
    level: env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    formatters: {
      level: label => ({ level: label }),
    },
    serializers: {
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  };

  // Development configuration with pretty printing
  if (isDevelopment) {
    return {
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    };
  }

  // Test environment - minimal output
  if (isTest) {
    return {
      ...baseConfig,
      level: 'error', // Only log errors during tests
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: false,
          translateTime: false,
          ignore: 'pid,hostname,time',
          singleLine: true,
        },
      },
    };
  }

  // Production configuration - JSON for log aggregation (goes to stdout)
  return {
    ...baseConfig,
    timestamp: pino.stdTimeFunctions.isoTime,
  };
};

/**
 * Root logger instance
 */
const rootLogger = pino(getLoggerConfig());

/**
 * Module registry for consistent module naming
 * Add new modules here as the application grows
 */
export const LOG_MODULES = {
  // Core system modules
  AUTH: 'auth',
  DATABASE: 'database',
  HTTP: 'http',

  // Feature modules
  ANALYTICS: 'analytics',
  MAIL: 'mail',
  UI: 'ui',
} as const;

export type LogModule = (typeof LOG_MODULES)[keyof typeof LOG_MODULES];

/**
 * Simple logger interface - message first, then optional context
 */
export const logger = {
  /**
   * Log at debug level
   */
  debug: (message: string, context?: Record<string, unknown>) => {
    if (context) {
      rootLogger.debug(context, message);
    } else {
      rootLogger.debug(message);
    }
  },

  /**
   * Log at info level
   */
  info: (message: string, context?: Record<string, unknown>) => {
    if (context) {
      rootLogger.info(context, message);
    } else {
      rootLogger.info(message);
    }
  },

  /**
   * Log at warn level
   */
  warn: (message: string, context?: Record<string, unknown>) => {
    if (context) {
      rootLogger.warn(context, message);
    } else {
      rootLogger.warn(message);
    }
  },

  /**
   * Log at error level
   */
  error: (message: string, context?: Record<string, unknown>) => {
    if (context) {
      rootLogger.error(context, message);
    } else {
      rootLogger.error(message);
    }
  },

  /**
   * Log at fatal level
   */
  fatal: (message: string, context?: Record<string, unknown>) => {
    if (context) {
      rootLogger.fatal(context, message);
    } else {
      rootLogger.fatal(message);
    }
  },

  /**
   * Create a child logger with persistent context
   * Useful for adding context that applies to multiple log calls
   */
  child: (context: Record<string, unknown>) => {
    const childLogger = rootLogger.child(context);
    return {
      debug: (message: string, extraContext?: Record<string, unknown>) => {
        childLogger.debug(extraContext ?? {}, message);
      },
      info: (message: string, extraContext?: Record<string, unknown>) => {
        childLogger.info(extraContext ?? {}, message);
      },
      warn: (message: string, extraContext?: Record<string, unknown>) => {
        childLogger.warn(extraContext ?? {}, message);
      },
      error: (message: string, extraContext?: Record<string, unknown>) => {
        childLogger.error(extraContext ?? {}, message);
      },
      fatal: (message: string, extraContext?: Record<string, unknown>) => {
        childLogger.fatal(extraContext ?? {}, message);
      },
    };
  },

  /**
   * Create a logger for a specific module/feature
   * Accepts both predefined modules from LOG_MODULES and custom module names
   */
  forModule: (moduleName: LogModule | string) => {
    return logger.child({ module: moduleName });
  },

  /**
   * Create a logger for HTTP requests
   */
  forRequest: (requestId: string) => {
    return logger.child({ requestId, module: LOG_MODULES.HTTP });
  },

  /**
   * Create a logger for database operations
   */
  forDatabase: () => {
    return logger.child({ module: LOG_MODULES.DATABASE });
  },

  /**
   * Create a logger for authentication operations
   */
  forAuth: () => {
    return logger.child({ module: LOG_MODULES.AUTH });
  },

  /**
   * Create a logger for analytics operations
   */
  forAnalytics: () => {
    return logger.child({ module: LOG_MODULES.ANALYTICS });
  },
};

/**
 * Legacy export for backward compatibility
 * @deprecated Use the logger object methods instead
 */
export const createLogger = (context: Record<string, unknown>) =>
  logger.child(context);

/**
 * Default logger instance for simple usage
 * @deprecated Use the logger object methods instead
 */
export const defaultLogger = logger;
