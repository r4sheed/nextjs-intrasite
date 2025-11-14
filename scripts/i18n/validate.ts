#!/usr/bin/env tsx
/**
 * i18n Validate Script
 *
 * Validates translation files for:
 * - Missing translations (keys in EN but not in HU)
 * - Extra translations (keys in HU but not in EN)
 * - TypeScript constants sync (constants file vs JSON files)
 *
 * Usage:
 *   npm run i18n:validate
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { LOCALES_DIR } from './constants';
import { getLanguages, getDomains, getConstantsPath } from './helpers';

import { defaultLocale } from '@/i18n/config';

interface ValidationError {
  type: 'missing' | 'extra' | 'mismatch';
  file: string;
  key: string;
  details?: string;
}

const errors: ValidationError[] = [];
const warnings: ValidationError[] = [];

/**
 * Get all keys from a nested object
 */
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Compare two locale files for a specific language pair
 */
async function compareLocaleFiles(
  sourcePath: string,
  targetPath: string,
  sourceLang: string,
  targetLang: string,
  domain: string
): Promise<void> {
  const sourceContent = await readFile(sourcePath, 'utf-8');
  const targetContent = await readFile(targetPath, 'utf-8');

  const sourceJson = JSON.parse(sourceContent);
  const targetJson = JSON.parse(targetContent);

  const sourceKeys = getAllKeys(sourceJson);
  const targetKeys = getAllKeys(targetJson);

  // Find missing keys (in source but not in target)
  for (const key of sourceKeys) {
    if (!targetKeys.includes(key)) {
      errors.push({
        type: 'missing',
        file: targetPath,
        key,
        details: `Missing ${targetLang} translation for: ${key}`,
      });
    }
  }

  // Find extra keys (in target but not in source)
  for (const key of targetKeys) {
    if (!sourceKeys.includes(key)) {
      warnings.push({
        type: 'extra',
        file: targetPath,
        key,
        details: `Extra ${targetLang} translation (not in ${sourceLang}): ${key}`,
      });
    }
  }

  console.log(
    `   ${domain}: ${sourceKeys.length} keys, ${errors.length} missing, ${warnings.length} extra`
  );
}

/**
 * Extract constant values from TypeScript file
 * Only extracts values from i18n constants (ERRORS, SUCCESS, LABELS, etc.)
 * Ignores CODES constants (those are error codes, not i18n keys)
 */
function extractConstantValues(content: string): string[] {
  const values: string[] = [];

  // Match i18n constants (exclude CODES constants)
  // Pattern: export const {DOMAIN}_{CATEGORY} = { ... }
  // where CATEGORY is not "CODES"
  const constantRegex =
    /export const (?!.*_CODES)(\w+) = \{([^}]+)\} as const;/g;
  let match;

  while ((match = constantRegex.exec(content)) !== null) {
    const constantBody = match[2];
    if (!constantBody) continue;

    const lines = constantBody.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i]!;
      const trimmed = line.trim();

      const singleLineMatch = trimmed.match(/^([A-Za-z0-9_]+):\s*'([^']+)',?$/);
      if (singleLineMatch) {
        const value = singleLineMatch[2];
        if (value) {
          values.push(value);
        }
        continue;
      }

      const multiLineKeyMatch = trimmed.match(/^([A-Za-z0-9_]+):$/);
      if (multiLineKeyMatch && i + 1 < lines.length) {
        const nextLine = lines[i + 1]!;
        const nextValueMatch = nextLine.trim().match(/^'([^']+)',?$/);
        if (nextValueMatch) {
          const value = nextValueMatch[1];
          if (value) {
            values.push(value);
          }
          i += 1;
        }
      }
    }
  }

  return values;
}

/**
 * Validate constants file against locale files
 */
async function validateConstants(
  constantsPath: string,
  localePath: string,
  _domain: string
): Promise<void> {
  if (!existsSync(constantsPath)) {
    warnings.push({
      type: 'mismatch',
      file: constantsPath,
      key: '',
      details: `Constants file not found: ${constantsPath}`,
    });
    return;
  }

  const constantsContent = await readFile(constantsPath, 'utf-8');
  const localeContent = await readFile(localePath, 'utf-8');

  const domain = _domain;
  const constantValues = extractConstantValues(constantsContent);
  const localeJson = JSON.parse(localeContent);
  const localeKeys = getAllKeys(localeJson);

  const domainPrefix = `${domain}.`;
  const domainLocaleKeys = localeKeys
    .filter(key => key.startsWith(domainPrefix))
    .map(key => key.slice(domainPrefix.length));

  const normalizedConstants = constantValues.map(value =>
    value.startsWith(domainPrefix) ? value.slice(domainPrefix.length) : value
  );

  const localeKeySet = new Set(domainLocaleKeys);
  const constantSet = new Set(normalizedConstants);

  // Find keys in constants but not in locale
  for (const value of normalizedConstants) {
    if (!localeKeySet.has(value)) {
      errors.push({
        type: 'mismatch',
        file: constantsPath,
        key: `${domainPrefix}${value}`,
        details: `Constant references non-existent key: ${domainPrefix}${value}`,
      });
    }
  }

  // Find keys in locale but not in constants
  for (const relativeKey of domainLocaleKeys) {
    if (!constantSet.has(relativeKey)) {
      warnings.push({
        type: 'mismatch',
        file: constantsPath,
        key: `${domainPrefix}${relativeKey}`,
        details: `Key exists in locale but not in constants: ${domainPrefix}${relativeKey}`,
      });
    }
  }
}

/**
 * Validate merged locale files
 */
async function validateMergedFiles(): Promise<void> {
  const baseLang = 'en';
  const otherLanguages = getLanguages().filter(lang => lang !== baseLang);

  for (const targetLang of otherLanguages) {
    const baseMergedPath = join(process.cwd(), LOCALES_DIR, `${baseLang}.json`);
    const targetMergedPath = join(
      process.cwd(),
      LOCALES_DIR,
      `${targetLang}.json`
    );

    if (!existsSync(baseMergedPath)) {
      errors.push({
        type: 'missing',
        file: baseMergedPath,
        key: '',
        details: `Missing merged base language (${baseLang}) file: ${baseLang}.json`,
      });
      continue;
    }

    if (!existsSync(targetMergedPath)) {
      errors.push({
        type: 'missing',
        file: targetMergedPath,
        key: '',
        details: `Missing merged ${targetLang} locale file: ${targetLang}.json`,
      });
      continue;
    }

    // Compare merged base vs target
    await compareLocaleFiles(
      baseMergedPath,
      targetMergedPath,
      baseLang,
      targetLang,
      'merged'
    );
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🔍 Validating i18n files...\n');

  const languages = getLanguages();
  const baseLang = defaultLocale;

  if (!languages.includes(baseLang)) {
    console.error(`❌ Base language (${baseLang}) must exist`);
    process.exit(1);
  }

  const domains = getDomains(baseLang);

  console.log(`📂 Detected languages: ${languages.join(', ')}`);
  console.log(`📂 Detected domains: ${domains.join(', ')}\n`);

  // Validate each domain - compare all languages against the base language (en)
  const otherLanguages = languages.filter(lang => lang !== baseLang);

  for (const domain of domains) {
    const basePath = join(
      process.cwd(),
      LOCALES_DIR,
      baseLang,
      `${domain}.json`
    );

    if (!existsSync(basePath)) {
      errors.push({
        type: 'missing',
        file: basePath,
        key: '',
        details: `Missing base language (${baseLang}) file for domain: ${domain}`,
      });
      continue;
    }

    console.log(`📦 Checking ${domain}...`);

    // Compare base language against each other language
    for (const targetLang of otherLanguages) {
      const targetPath = join(
        process.cwd(),
        LOCALES_DIR,
        targetLang,
        `${domain}.json`
      );

      if (!existsSync(targetPath)) {
        errors.push({
          type: 'missing',
          file: targetPath,
          key: '',
          details: `Missing ${targetLang} locale file for domain: ${domain}`,
        });
        continue;
      }

      await compareLocaleFiles(
        basePath,
        targetPath,
        baseLang,
        targetLang,
        domain
      );
    }

    // Validate constants (if exists) - using base language
    const constantsPath = getConstantsPath(domain);

    if (constantsPath && existsSync(constantsPath)) {
      await validateConstants(constantsPath, basePath, domain);
    }
  }

  // Validate merged files
  console.log('\n📦 Checking merged files...');
  await validateMergedFiles();

  // Print results
  console.log('\n' + '='.repeat(60));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All i18n files are valid!\n');
    return;
  }

  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} Error(s):\n`);
    for (const error of errors) {
      console.log(`   ${error.details}`);
      console.log(`      File: ${error.file}`);
      if (error.key) console.log(`      Key: ${error.key}`);
      console.log('');
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} Warning(s):\n`);
    for (const warning of warnings) {
      console.log(`   ${warning.details}`);
      console.log(`      File: ${warning.file}`);
      if (warning.key) console.log(`      Key: ${warning.key}`);
      console.log('');
    }
  }

  if (errors.length > 0) {
    console.log('❌ Validation failed!\n');
    process.exit(1);
  } else {
    console.log('✅ Validation passed with warnings\n');
  }
}

main();
