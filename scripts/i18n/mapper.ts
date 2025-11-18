#!/usr/bin/env tsx
/**
 * i18n Mapper Module
 *
 * Maps parsed constants to JSON structure and domains
 * Handles domain/category detection and custom object mappings
 */

import { ParsedConstant } from './parser';

export interface MappedConstant {
  constantName: string;
  domain: string;
  category: string;
  jsonPath: string; // e.g., 'navigation.labels'
  keys: Array<{ key: string; value: string; jsonKey: string }>;
  isCustomObject: boolean;
}

export interface MappingResult {
  standardMappings: MappedConstant[];
  customMappings: MappedConstant[];
}

/**
 * Map parsed constants to JSON structure
 */
export function mapConstants(constants: ParsedConstant[]): MappingResult {
  const standardMappings: MappedConstant[] = [];
  const customMappings: MappedConstant[] = [];

  for (const constant of constants) {
    const mapping = mapConstant(constant);

    if (mapping.isCustomObject) {
      customMappings.push(mapping);
    } else {
      standardMappings.push(mapping);
    }
  }

  return { standardMappings, customMappings };
}

/**
 * Map a single constant to JSON structure
 */
function mapConstant(constant: ParsedConstant): MappedConstant {
  const { constantName, keys } = constant;

  // Check if it's a custom object
  const customMapping = getCustomObjectMapping(constantName);
  if (customMapping) {
    return {
      constantName,
      domain: customMapping.domain,
      category: customMapping.category,
      jsonPath: customMapping.jsonPath,
      keys: keys.map(key => ({
        key: key.key,
        value: key.value,
        jsonKey: transformCustomValue(key.value, customMapping),
      })),
      isCustomObject: true,
    };
  }

  // Standard mapping
  const domain = detectDomain(constantName);
  const category = detectCategory(constantName);

  return {
    constantName,
    domain,
    category,
    jsonPath: `${domain}.${category}`,
    keys: keys.map(key => ({
      key: key.key,
      value: key.value,
      jsonKey: extractJsonKey(key.value), // Extract short key from full i18n key
    })),
    isCustomObject: false,
  };
}

/**
 * Detect domain from constant name
 * e.g., NAVIGATION_LABELS → navigation
 * Exported for testing purposes
 */
export function detectDomain(constantName: string): string {
  const upperName = constantName.toUpperCase();

  // Handle special cases first
  if (upperName.startsWith('CORE_')) {
    return 'errors'; // Core errors go to errors domain
  }

  // Extract domain from prefix (before first underscore)
  const parts = constantName.split('_');
  if (parts.length >= 2) {
    return parts[0]!.toLowerCase();
  }

  // Fallback: assume the constant name is the domain
  return constantName.toLowerCase();
}

/**
 * Detect category from constant name
 * e.g., NAVIGATION_LABELS → labels
 * Exported for testing purposes
 */
export function detectCategory(constantName: string): string {
  const upperName = constantName.toUpperCase();

  // Handle special cases
  if (upperName.startsWith('CORE_')) {
    return ''; // Core errors go directly under domain
  }

  // Extract category from suffix (after last underscore)
  const parts = constantName.split('_');
  if (parts.length >= 2) {
    return parts[parts.length - 1]!.toLowerCase();
  }

  // Fallback: assume 'labels' for single-part names
  return 'labels';
}

/**
 * Custom object mappings for special cases
 */
interface CustomObjectMapping {
  constantName: string;
  domain: string;
  category: string;
  jsonPath: string;
  valueTransform?: (value: string) => string;
}

/**
 * Get custom object mapping if exists
 */
function getCustomObjectMapping(
  constantName: string
): CustomObjectMapping | null {
  const mappings: CustomObjectMapping[] = [
    // Add custom mappings here as needed
    // Example:
    // {
    //   constantName: 'NAVIGATION_SECTIONS',
    //   domain: 'navigation',
    //   category: 'sections',
    //   jsonPath: 'navigation.sections',
    //   valueTransform: (value) => value, // Optional transformation
    // },
  ];

  return (
    mappings.find(mapping => mapping.constantName === constantName) || null
  );
}

/**
 * Transform custom object values (if needed)
 */
function transformCustomValue(
  value: string,
  mapping: CustomObjectMapping
): string {
  if (mapping.valueTransform) {
    return mapping.valueTransform(value);
  }
  return value;
}

/**
 * Extract JSON key from full i18n key
 * e.g., 'labels.account-title' → 'account-title'
 */
function extractJsonKey(fullKey: string): string {
  const parts = fullKey.split('.');
  return parts[parts.length - 1] || fullKey;
}

/**
 * Validate constant name format
 */
export function validateConstantName(constantName: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Must be UPPER_SNAKE_CASE
  if (!/^[A-Z][A-Z0-9_]*$/.test(constantName)) {
    errors.push(`Constant name '${constantName}' must be UPPER_SNAKE_CASE`);
  }

  // Must have at least one underscore (DOMAIN_CATEGORY format)
  if (!constantName.includes('_')) {
    errors.push(
      `Constant name '${constantName}' must be in DOMAIN_CATEGORY format`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate key format (camelCase)
 */
export function validateKeyFormat(key: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Must be camelCase
  if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) {
    errors.push(`Key '${key}' must be camelCase`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
