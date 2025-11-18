#!/usr/bin/env tsx
import { describe, it, expect } from 'vitest';

import {
  CUSTOM_OBJECT_MAPPINGS,
  getCustomObjectMapping,
  hasCustomMapping,
  validateCustomMappings,
} from '../custom-objects';

describe('Custom Objects Module', () => {
  describe('CUSTOM_OBJECT_MAPPINGS', () => {
    it('should be an array', () => {
      expect(Array.isArray(CUSTOM_OBJECT_MAPPINGS)).toBe(true);
    });

    it('should start empty', () => {
      expect(CUSTOM_OBJECT_MAPPINGS).toHaveLength(0);
    });
  });

  describe('getCustomObjectMapping', () => {
    it('should return null for non-existent mappings', () => {
      expect(getCustomObjectMapping('NON_EXISTENT')).toBeNull();
      expect(getCustomObjectMapping('NAVIGATION_SECTIONS')).toBeNull();
    });

    it('should return mapping when it exists', () => {
      // This test will pass when we add actual mappings
      // For now, it should return null
      const result = getCustomObjectMapping('ANY_CONSTANT');
      expect(result).toBeNull();
    });
  });

  describe('hasCustomMapping', () => {
    it('should return false for non-existent mappings', () => {
      expect(hasCustomMapping('NON_EXISTENT')).toBe(false);
      expect(hasCustomMapping('NAVIGATION_SECTIONS')).toBe(false);
    });
  });

  describe('validateCustomMappings', () => {
    it('should validate empty mappings as valid', () => {
      const result = validateCustomMappings();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct mappings', () => {
      // Temporarily add a valid mapping for testing
      const originalMappings = [...CUSTOM_OBJECT_MAPPINGS];
      CUSTOM_OBJECT_MAPPINGS.push({
        constantName: 'TEST_SECTIONS',
        domain: 'test',
        category: 'sections',
        jsonPath: 'test.sections',
      });

      const result = validateCustomMappings();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Restore original
      CUSTOM_OBJECT_MAPPINGS.splice(
        0,
        CUSTOM_OBJECT_MAPPINGS.length,
        ...originalMappings
      );
    });

    it('should detect invalid jsonPath format', () => {
      const originalMappings = [...CUSTOM_OBJECT_MAPPINGS];
      CUSTOM_OBJECT_MAPPINGS.push({
        constantName: 'INVALID_MAPPING',
        domain: 'test',
        category: 'sections',
        jsonPath: 'testsections', // Missing dot
      });

      const result = validateCustomMappings();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Custom mapping for 'INVALID_MAPPING': jsonPath 'testsections' must contain a dot"
      );

      // Restore original
      CUSTOM_OBJECT_MAPPINGS.splice(
        0,
        CUSTOM_OBJECT_MAPPINGS.length,
        ...originalMappings
      );
    });

    it('should detect domain mismatch', () => {
      const originalMappings = [...CUSTOM_OBJECT_MAPPINGS];
      CUSTOM_OBJECT_MAPPINGS.push({
        constantName: 'DOMAIN_MISMATCH',
        domain: 'wrong',
        category: 'sections',
        jsonPath: 'test.sections', // Domain doesn't match
      });

      const result = validateCustomMappings();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Custom mapping for 'DOMAIN_MISMATCH': domain 'wrong' doesn't match jsonPath 'test.sections'"
      );

      // Restore original
      CUSTOM_OBJECT_MAPPINGS.splice(
        0,
        CUSTOM_OBJECT_MAPPINGS.length,
        ...originalMappings
      );
    });

    it('should detect category mismatch', () => {
      const originalMappings = [...CUSTOM_OBJECT_MAPPINGS];
      CUSTOM_OBJECT_MAPPINGS.push({
        constantName: 'CATEGORY_MISMATCH',
        domain: 'test',
        category: 'wrong',
        jsonPath: 'test.sections', // Category doesn't match
      });

      const result = validateCustomMappings();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Custom mapping for 'CATEGORY_MISMATCH': category 'wrong' doesn't match jsonPath 'test.sections'"
      );

      // Restore original
      CUSTOM_OBJECT_MAPPINGS.splice(
        0,
        CUSTOM_OBJECT_MAPPINGS.length,
        ...originalMappings
      );
    });
  });
});
