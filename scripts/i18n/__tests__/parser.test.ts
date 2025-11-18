#!/usr/bin/env tsx
import { describe, it, expect } from 'vitest';

import { parseStringsFile, parseConstantBody } from '../parser';

describe('Parser Module', () => {
  describe('parseConstantBody', () => {
    it('should parse single-line entries', () => {
      const body = `
        accountTitle: 'labels.account-title',
        adminTitle: 'labels.admin-title',
      `;

      const result = parseConstantBody(body);
      expect(result).toEqual([
        { key: 'accountTitle', value: 'labels.account-title' },
        { key: 'adminTitle', value: 'labels.admin-title' },
      ]);
    });

    it('should parse multi-line entries', () => {
      const body = `
        accountTitle:
          'labels.account-title',
        adminTitle: 'labels.admin-title',
      `;

      const result = parseConstantBody(body);
      expect(result).toEqual([
        { key: 'accountTitle', value: 'labels.account-title' },
        { key: 'adminTitle', value: 'labels.admin-title' },
      ]);
    });

    it('should skip comments and empty lines', () => {
      const body = `
        // This is a comment
        accountTitle: 'labels.account-title',

        adminTitle: 'labels.admin-title',
      `;

      const result = parseConstantBody(body);
      expect(result).toEqual([
        { key: 'accountTitle', value: 'labels.account-title' },
        { key: 'adminTitle', value: 'labels.admin-title' },
      ]);
    });

    it('should handle empty values', () => {
      const body = `
        emptyKey: '',
        normalKey: 'labels.normal',
      `;

      const result = parseConstantBody(body);
      expect(result).toEqual([
        { key: 'emptyKey', value: '' },
        { key: 'normalKey', value: 'labels.normal' },
      ]);
    });
  });

  describe('parseStringsFile', () => {
    it('should parse navigation strings file', async () => {
      const result = await parseStringsFile(
        'src/features/navigation/lib/strings.ts'
      );

      expect(result.filePath).toBe('src/features/navigation/lib/strings.ts');
      expect(result.constants).toHaveLength(1);

      const constant = result.constants[0]!;
      expect(constant.constantName).toBe('NAVIGATION_LABELS');
      expect(constant.keys).toContainEqual({
        key: 'accountTitle',
        value: 'labels.account-title',
      });
      expect(constant.keys).toContainEqual({
        key: 'loginTitle',
        value: 'labels.login-title',
      });
    });

    it('should include line numbers', async () => {
      const result = await parseStringsFile(
        'src/features/navigation/lib/strings.ts'
      );

      const constant = result.constants[0]!;
      expect(constant.lineNumber).toBeGreaterThan(0);
      expect(typeof constant.lineNumber).toBe('number');
    });

    it('should handle non-existent file', async () => {
      await expect(parseStringsFile('non-existent.ts')).rejects.toThrow();
    });
  });
});
