/**
 * i18n Constants
 *
 * Centralized constants for i18n scripts
 */

// Directory paths
export const LOCALES_DIR = 'src/locales';
export const FEATURES_DIR = 'src/features';

// File paths
export const CORE_STRINGS_PATH = 'src/lib/errors/strings.ts';
export const STRINGS_DIR = 'lib';
export const STRINGS_FILE_NAME = 'strings.ts';

// File patterns - statically defined for now
export const ROOT_LOCALE_FILES = ['en.json', 'hu.json'] as const;

// Label suffix ordering (lower number = higher priority)
export const LABEL_SUFFIX_ORDER = [
  'title',
  'subtitle',
  'description',
  'tab',
  'label',
  'placeholder',
  'button',
  'link',
  'name',
  'text',
  'message',
  'error',
  'success',
  'info',
  'warning',
  '', // suffix-less keys last
] as const;

export type LabelSuffix = (typeof LABEL_SUFFIX_ORDER)[number];
