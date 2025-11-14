/**
 * i18n Constants
 *
 * Centralized constants for i18n scripts
 */

import { getLanguages } from './helpers';

// Directory paths
export const LOCALES_DIR = 'src/locales';
export const FEATURES_DIR = 'src/features';

// File paths
export const CORE_STRINGS_PATH = 'src/lib/errors/messages.ts';
export const STRINGS_DIR = 'lib';
export const STRINGS_FILE_NAME = 'strings.ts';

// File patterns - dynamically generated from available languages
export const ROOT_LOCALE_FILES = getLanguages().map(
  lang => `${lang}.json`
) as readonly string[];

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
