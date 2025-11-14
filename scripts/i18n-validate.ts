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
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

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
 * Compare two JSON files
 */
async function compareLocaleFiles(
  enPath: string,
  huPath: string,
  domain: string
): Promise<void> {
  const enContent = await readFile(enPath, 'utf-8');
  const huContent = await readFile(huPath, 'utf-8');

  const enJson = JSON.parse(enContent);
  const huJson = JSON.parse(huContent);

  const enKeys = getAllKeys(enJson);
  const huKeys = getAllKeys(huJson);

  // Find missing keys (in EN but not in HU)
  for (const key of enKeys) {
    if (!huKeys.includes(key)) {
      errors.push({
        type: 'missing',
        file: huPath,
        key,
        details: `Missing Hungarian translation for: ${key}`,
      });
    }
  }

  // Find extra keys (in HU but not in EN)
  for (const key of huKeys) {
    if (!enKeys.includes(key)) {
      warnings.push({
        type: 'extra',
        file: huPath,
        key,
        details: `Extra Hungarian translation (not in EN): ${key}`,
      });
    }
  }

  console.log(
    `   ${domain}: ${enKeys.length} keys, ${errors.length} missing, ${warnings.length} extra`
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
  const enMergedPath = join(process.cwd(), 'src/locales/en.json');
  const huMergedPath = join(process.cwd(), 'src/locales/hu.json');

  if (!existsSync(enMergedPath)) {
    errors.push({
      type: 'missing',
      file: enMergedPath,
      key: '',
      details: 'Missing merged English locale file: en.json',
    });
    return;
  }

  if (!existsSync(huMergedPath)) {
    errors.push({
      type: 'missing',
      file: huMergedPath,
      key: '',
      details: 'Missing merged Hungarian locale file: hu.json',
    });
    return;
  }

  // Compare merged EN vs HU
  await compareLocaleFiles(enMergedPath, huMergedPath, 'merged');
}

/**
 * Main function
 */
async function main() {
  console.log('\n🔍 Validating i18n files...\n');

  // Dynamically detect domains from features + common domains
  const featuresDir = join(process.cwd(), 'src/features');
  const featureDirs = existsSync(featuresDir) ? await readdir(featuresDir) : [];
  const commonDomains = ['common', 'errors', 'navigation'];
  const domains = [
    ...featureDirs.filter(dir => !dir.startsWith('.')),
    ...commonDomains,
  ];

  console.log(`📂 Detected domains: ${domains.join(', ')}\n`);

  // Check if all domains have JSON files
  for (const domain of domains) {
    const enPath = join(process.cwd(), `src/locales/en/${domain}.json`);
    const huPath = join(process.cwd(), `src/locales/hu/${domain}.json`);

    if (!existsSync(enPath)) {
      errors.push({
        type: 'missing',
        file: enPath,
        key: '',
        details: `Missing English locale file for domain: ${domain}`,
      });
    }

    if (!existsSync(huPath)) {
      errors.push({
        type: 'missing',
        file: huPath,
        key: '',
        details: `Missing Hungarian locale file for domain: ${domain}`,
      });
    }
  }

  // Validate each domain
  for (const domain of domains) {
    const enPath = join(process.cwd(), `src/locales/en/${domain}.json`);
    const huPath = join(process.cwd(), `src/locales/hu/${domain}.json`);

    if (!existsSync(enPath) || !existsSync(huPath)) continue;

    console.log(`📦 Checking ${domain}...`);

    // Compare EN vs HU
    await compareLocaleFiles(enPath, huPath, domain);

    // Validate constants (if exists)
    let constantsPath: string | undefined;
    if (domain === 'errors') {
      constantsPath = join(process.cwd(), 'src/lib/errors/messages.ts');
    } else {
      // Try feature directory
      constantsPath = join(
        process.cwd(),
        `src/features/${domain}/lib/strings.ts`
      );
    }

    if (constantsPath && existsSync(constantsPath)) {
      await validateConstants(constantsPath, enPath, domain);
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
