import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  LOCALES_DIR,
  FEATURES_DIR,
  CORE_STRINGS_PATH,
  STRINGS_DIR,
  STRINGS_FILE_NAME,
  LABEL_SUFFIX_ORDER,
} from './constants';

/**
 * Get list of available languages from src/locales directory
 * Returns language codes like ['en', 'hu']
 */
export function getLanguages(): string[] {
  const localesDir = join(process.cwd(), LOCALES_DIR);
  const items = readdirSync(localesDir, { withFileTypes: true });

  // Get directories that are language folders (exclude .json files)
  const languages = items
    .filter(item => item.isDirectory() && !item.name.includes('.'))
    .map(item => item.name)
    .sort();

  return languages;
}

/**
 * Get list of domains from a language directory
 * Returns domain names like ['auth', 'common', 'errors', 'navigation']
 */
export function getDomains(lang: string): string[] {
  const langDir = join(process.cwd(), LOCALES_DIR, lang);
  const items = readdirSync(langDir, { withFileTypes: true });

  // Get .json files (domains)
  const domains = items
    .filter(item => item.isFile() && item.name.endsWith('.json'))
    .map(item => item.name.replace('.json', ''))
    .sort();

  return domains;
}

/**
 * Get the constants file path for a domain
 * Returns the path to the TypeScript strings file for the given domain
 */
export function getConstantsPath(domain: string): string {
  if (domain === 'errors') {
    return join(process.cwd(), CORE_STRINGS_PATH);
  } else {
    // Try feature directory
    return join(
      process.cwd(),
      FEATURES_DIR,
      domain,
      STRINGS_DIR,
      STRINGS_FILE_NAME
    );
  }
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, char) =>
    /[0-9]/.test(char) ? char : char.toUpperCase()
  );
}

/**
 * Get the rank of a label suffix for sorting
 * Lower rank = higher priority (appears first)
 */
export function getLabelSuffixRank(key: string): number {
  const normalized = key.toLowerCase();
  let fallbackIndex = LABEL_SUFFIX_ORDER.length as number;

  for (let index = 0; index < LABEL_SUFFIX_ORDER.length; index++) {
    const suffix = LABEL_SUFFIX_ORDER[index]!;

    if (suffix === '') {
      fallbackIndex = index;
      continue;
    }

    if (normalized.length > suffix.length && normalized.endsWith(suffix)) {
      return index;
    }
  }

  return fallbackIndex === LABEL_SUFFIX_ORDER.length
    ? LABEL_SUFFIX_ORDER.length
    : fallbackIndex;
}
