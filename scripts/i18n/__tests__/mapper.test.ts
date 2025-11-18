#!/usr/bin/env tsx
import { describe, it, expect } from 'vitest';

import {
  mapConstants,
  validateConstantName,
  validateKeyFormat,
  detectDomain,
  detectCategory,
} from '../mapper';

describe('Mapper Module', () => {
  describe('detectDomain', () => {
    it('should detect domain from standard constant names', () => {
      expect(detectDomain('NAVIGATION_LABELS')).toBe('navigation');
      expect(detectDomain('AUTH_ERRORS')).toBe('auth');
      expect(detectDomain('POSTS_SUCCESS')).toBe('posts');
    });

    it('should handle CORE constants', () => {
      expect(detectDomain('CORE_ERRORS')).toBe('errors');
      expect(detectDomain('CORE_SUCCESS')).toBe('errors');
    });

    it('should handle single-part names', () => {
      expect(detectDomain('LABELS')).toBe('labels');
    });
  });

  describe('detectCategory', () => {
    it('should detect category from standard constant names', () => {
      expect(detectCategory('NAVIGATION_LABELS')).toBe('labels');
      expect(detectCategory('AUTH_ERRORS')).toBe('errors');
      expect(detectCategory('POSTS_SUCCESS')).toBe('success');
    });

    it('should handle CORE constants', () => {
      expect(detectCategory('CORE_ERRORS')).toBe('');
      expect(detectCategory('CORE_SUCCESS')).toBe('');
    });

    it('should handle single-part names', () => {
      expect(detectCategory('LABELS')).toBe('labels');
    });
  });

  describe('validateConstantName', () => {
    it('should validate correct constant names', () => {
      const result = validateConstantName('NAVIGATION_LABELS');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject lowercase names', () => {
      const result = validateConstantName('navigation_labels');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Constant name 'navigation_labels' must be UPPER_SNAKE_CASE"
      );
    });

    it('should reject names without underscores', () => {
      const result = validateConstantName('LABELS');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Constant name 'LABELS' must be in DOMAIN_CATEGORY format"
      );
    });

    it('should reject names with invalid characters', () => {
      const result = validateConstantName('NAVIGATION-LABELS');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Constant name 'NAVIGATION-LABELS' must be UPPER_SNAKE_CASE"
      );
    });
  });

  describe('validateKeyFormat', () => {
    it('should validate correct camelCase keys', () => {
      const result = validateKeyFormat('accountTitle');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate single letter keys', () => {
      const result = validateKeyFormat('a');
      expect(result.valid).toBe(true);
    });

    it('should reject PascalCase keys', () => {
      const result = validateKeyFormat('AccountTitle');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Key 'AccountTitle' must be camelCase");
    });

    it('should reject kebab-case keys', () => {
      const result = validateKeyFormat('account-title');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Key 'account-title' must be camelCase");
    });

    it('should reject UPPER_SNAKE_CASE keys', () => {
      const result = validateKeyFormat('ACCOUNT_TITLE');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Key 'ACCOUNT_TITLE' must be camelCase");
    });
  });

  describe('mapConstants', () => {
    it('should map standard constants correctly', () => {
      const constants = [
        {
          constantName: 'NAVIGATION_LABELS',
          keys: [
            { key: 'accountTitle', value: 'labels.account-title' },
            { key: 'loginTitle', value: 'labels.login-title' },
          ],
          filePath: 'src/features/navigation/lib/strings.ts',
          lineNumber: 10,
        },
      ];

      const result = mapConstants(constants);

      expect(result.standardMappings).toHaveLength(1);
      expect(result.customMappings).toHaveLength(0);

      const mapping = result.standardMappings[0]!;
      expect(mapping.domain).toBe('navigation');
      expect(mapping.category).toBe('labels');
      expect(mapping.jsonPath).toBe('navigation.labels');
      expect(mapping.isCustomObject).toBe(false);
      expect(mapping.keys).toHaveLength(2);
    });

    it('should handle custom object mappings', () => {
      // Note: Currently no custom mappings defined, so this will be standard
      const constants = [
        {
          constantName: 'NAVIGATION_SECTIONS',
          keys: [{ key: 'main', value: 'sections.main' }],
          filePath: 'src/features/navigation/lib/strings.ts',
          lineNumber: 20,
        },
      ];

      const result = mapConstants(constants);

      expect(result.standardMappings).toHaveLength(1);
      expect(result.customMappings).toHaveLength(0);

      const mapping = result.standardMappings[0]!;
      expect(mapping.domain).toBe('navigation');
      expect(mapping.category).toBe('sections');
    });
  });
});
