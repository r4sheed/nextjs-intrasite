#!/usr/bin/env tsx
/**
 * i18n Custom Objects Configuration
 *
 * Defines mappings for special objects that don't follow standard i18n patterns
 * These objects are mapped to specific JSON paths in the locale files
 */

export interface CustomObjectMapping {
  /** The constant name in strings.ts (e.g., 'NAVIGATION_SECTIONS') */
  constantName: string;
  /** The target domain (e.g., 'navigation') */
  domain: string;
  /** The target category (e.g., 'sections') */
  category: string;
  /** The full JSON path (e.g., 'navigation.sections') */
  jsonPath: string;
  /** Optional value transformation function */
  valueTransform?: (value: string) => string;
  /** Optional validation function */
  validation?: (value: string) => boolean;
}

/**
 * Custom object mappings
 * Add new mappings here when special objects need custom handling
 */
export const CUSTOM_OBJECT_MAPPINGS: CustomObjectMapping[] = [
  // Example mapping (currently commented out):
  // {
  //   constantName: 'NAVIGATION_SECTIONS',
  //   domain: 'navigation',
  //   category: 'sections',
  //   jsonPath: 'navigation.sections',
  //   valueTransform: (value) => value, // Optional: transform values if needed
  //   validation: (value) => value.startsWith('sections.'), // Optional: validate values
  // },
  // Add more custom mappings as needed...
];

/**
 * Get custom object mapping by constant name
 */
export function getCustomObjectMapping(
  constantName: string
): CustomObjectMapping | null {
  return (
    CUSTOM_OBJECT_MAPPINGS.find(
      mapping => mapping.constantName === constantName
    ) || null
  );
}

/**
 * Check if a constant name has a custom mapping
 */
export function hasCustomMapping(constantName: string): boolean {
  return getCustomObjectMapping(constantName) !== null;
}

/**
 * Validate all custom object mappings
 */
export function validateCustomMappings(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const mapping of CUSTOM_OBJECT_MAPPINGS) {
    // Validate jsonPath format
    if (!mapping.jsonPath.includes('.')) {
      errors.push(
        `Custom mapping for '${mapping.constantName}': jsonPath '${mapping.jsonPath}' must contain a dot`
      );
    }

    // Validate domain/category consistency
    const [pathDomain, pathCategory] = mapping.jsonPath.split('.', 2);
    if (pathDomain !== mapping.domain) {
      errors.push(
        `Custom mapping for '${mapping.constantName}': domain '${mapping.domain}' doesn't match jsonPath '${mapping.jsonPath}'`
      );
    }
    if (pathCategory && pathCategory !== mapping.category) {
      errors.push(
        `Custom mapping for '${mapping.constantName}': category '${mapping.category}' doesn't match jsonPath '${mapping.jsonPath}'`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
