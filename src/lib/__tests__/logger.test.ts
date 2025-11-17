import { describe, it, expect } from 'vitest';

import { AppError } from '@/lib/errors';
import { logger, logModules } from '@/lib/logger';

describe('Logger Utility', () => {
  it('should export logger object with expected methods', () => {
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('debug');
    expect(logger).toHaveProperty('fatal');
    expect(logger).toHaveProperty('child');
    expect(logger).toHaveProperty('forModule');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should export predefined log modules', () => {
    expect(logModules).toHaveProperty('auth');
    expect(logModules).toHaveProperty('database');
    expect(logModules).toHaveProperty('http');
    expect(logModules).toHaveProperty('analytics');
    expect(logModules).toHaveProperty('mail');
    expect(logModules).toHaveProperty('ui');
  });

  it('should create child logger for auth module', () => {
    const authLogger = logger.forAuth();
    expect(authLogger).toBeDefined();
    expect(typeof authLogger.info).toBe('function');
  });

  it('should create child logger for database module', () => {
    const dbLogger = logger.forDatabase();
    expect(dbLogger).toBeDefined();
    expect(typeof dbLogger.error).toBe('function');
  });

  it('should create child logger for HTTP requests', () => {
    const httpLogger = logger.forRequest('req-123');
    expect(httpLogger).toBeDefined();
    expect(typeof httpLogger.info).toBe('function');
  });

  it('should create child logger for analytics', () => {
    const analyticsLogger = logger.forAnalytics();
    expect(analyticsLogger).toBeDefined();
  });

  it('should create child logger for mail operations', () => {
    const mailLogger = logger.forMail();
    expect(mailLogger).toBeDefined();
  });

  it('should create child logger for UI operations', () => {
    const uiLogger = logger.forUI();
    expect(uiLogger).toBeDefined();
  });

  it('should create generic child logger with custom module', () => {
    const customLogger = logger.forModule('custom-module');
    expect(customLogger).toBeDefined();
  });

  it('should create child logger with custom context', () => {
    const contextLogger = logger.child({ userId: '123', sessionId: 'abc' });
    expect(contextLogger).toBeDefined();
  });

  // Note: Since logger uses Pino with silent level in test environment,
  // we can't easily test the actual logging output without complex mocking.
  // These tests verify the API surface and that methods can be called without errors.

  it('should call logger methods without throwing', () => {
    expect(() => logger.info('Test message')).not.toThrow();
    expect(() => logger.error(new Error('Test error'))).not.toThrow();
    expect(() => logger.warn('Warning message')).not.toThrow();
    expect(() => logger.debug('Debug message')).not.toThrow();
    expect(() => logger.fatal('Fatal message')).not.toThrow();
  });

  it('should handle AppError logging without throwing', () => {
    const appError = new AppError({
      code: 'TEST_ERROR',
      message: { key: 'test.error' },
      httpStatus: 500,
    });
    expect(() => logger.error(appError)).not.toThrow();
  });

  it('should handle logging with complex objects', () => {
    const complexObject = {
      user: { id: '123', name: 'John' },
      metadata: { timestamp: new Date(), version: '1.0' },
      nested: { deep: { value: 42 } },
    };
    expect(() => logger.info(complexObject, 'Complex log')).not.toThrow();
  });

  it('should handle Error objects with custom messages', () => {
    const error = new Error('Original error');
    expect(() => logger.error(error, 'Custom error message')).not.toThrow();
  });

  it('should handle AppError with i18n object message', () => {
    const appError = new AppError({
      code: 'I18N_MESSAGE',
      message: { key: 'errors.custom.message', params: { count: 5 } },
      httpStatus: 422,
    });
    expect(() => logger.error(appError)).not.toThrow();
  });

  it('should handle logging with empty objects and arrays', () => {
    expect(() => logger.info({}, 'Empty object')).not.toThrow();
    expect(() =>
      logger.info({ items: [] }, 'Object with empty array')
    ).not.toThrow();
  });

  it('should handle logging with special data types', () => {
    expect(() =>
      logger.info({ date: new Date(), regex: /test/ })
    ).not.toThrow();
  });

  it('should create child logger with request ID for HTTP module', () => {
    const requestLogger = logger.forRequest('req-456', 'http');
    expect(requestLogger).toBeDefined();
  });

  it('should create child logger with custom module name', () => {
    const customModuleLogger = logger.forModule('payments');
    expect(customModuleLogger).toBeDefined();
  });

  it('should handle multiple context merges in child loggers', () => {
    const baseContext = { userId: '123' };
    const childLogger = logger.child(baseContext);
    expect(childLogger).toBeDefined();
    // Child of child should also work
    const grandChild = childLogger.child({ action: 'login' });
    expect(grandChild).toBeDefined();
  });

  it('should handle logging methods with all log levels', () => {
    expect(() => {
      logger.debug('Debug level');
      logger.info('Info level');
      logger.warn('Warning level');
      logger.error('Error level');
      logger.fatal('Fatal level');
    }).not.toThrow();
  });

  it('should handle logging with numeric and boolean values', () => {
    expect(() =>
      logger.info({ count: 42, active: true, ratio: 3.14 })
    ).not.toThrow();
  });

  it('should handle Error objects without stack traces', () => {
    const error = new Error('No stack');
    error.stack = undefined;
    expect(() => logger.error(error)).not.toThrow();
  });
});
