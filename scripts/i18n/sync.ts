#!/usr/bin/env tsx
/**
 * i18n Strings-First Sync Script
 *
 * Generates JSON files from strings.ts constants (strings-first approach)
 * This is the main sync script that replaces the old JSON-first workflow
 *
 * Features:
 * - Generates JSON from strings.ts files
 * - Removes keys not present in strings.ts
 * - Merges domain files into combined locale files
 * - Sorts all files for consistency
 * - Validates the result
 *
 * Usage:
 *   npx tsx scripts/i18n/sync-strings-first.ts [--dry-run]
 */

import { existsSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getStringsFiles, getLanguages, getDomains } from './helpers';
import {
  mapConstants,
  validateConstantName,
  validateKeyFormat,
  type MappedConstant,
} from './mapper';
import { parseStringsFiles, type ParsedStringsFile } from './parser';
import { sortObjectKeys } from './sort';

const isDryRun = process.argv.includes('--dry-run');

/**
 * Constants to exclude from i18n sync (e.g., error codes that won't be translated)
 */
const EXCLUDED_CONSTANTS = ['_CODES'];

interface SyncAction {
  type: 'add' | 'remove' | 'update';
  file: string;
  key: string;
  value?: string;
  detail?: string;
}

const actions: SyncAction[] = [];

/**
 * Generate empty JSON structure from mapped constants (for new keys only)
 */
function generateEmptyStructureFromMappings(
  mappings: MappedConstant[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const mapping of mappings) {
    const { domain, category, keys } = mapping;

    // Ensure domain exists
    if (!result[domain]) {
      result[domain] = {};
    }

    const domainObj = result[domain] as Record<string, unknown>;

    // If category is empty, add keys directly under domain
    if (!category) {
      for (const key of keys) {
        const jsonKey = key.jsonKey;
        domainObj[jsonKey] = '';
      }
    } else {
      // Ensure category exists
      if (!domainObj[category]) {
        domainObj[category] = {};
      }

      // Add keys with empty values
      for (const key of keys) {
        const jsonKey = key.jsonKey;
        (
          (result[domain] as Record<string, unknown>)[category] as Record<
            string,
            unknown
          >
        )[jsonKey] = '';
      }
    }
  }

  return result;
}

/**
 * Generate placeholder translation value
 * In a real implementation, this would use actual translations
 */
function generatePlaceholderValue(i18nKey: string): string {
  // Extract the last part after the last dot
  const parts = i18nKey.split('.');
  const key = parts[parts.length - 1];

  if (!key) {
    return 'MISSING_KEY';
  }

  // Convert kebab-case to Title Case
  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Update domain JSON file with new data
 */
async function updateDomainJson(
  domain: string,
  newData: Record<string, unknown>,
  locale: string
): Promise<void> {
  const domainFile = join(
    process.cwd(),
    'src',
    'locales',
    locale,
    `${domain}.json`
  );

  let existingData: Record<string, unknown> = {};
  if (existsSync(domainFile)) {
    const content = await readFile(domainFile, 'utf-8');
    existingData = JSON.parse(content);
  }

  // Soft merge: preserve existing values, add missing keys as empty strings
  const mergedData = addMissingKeys(existingData, newData);

  // Remove keys that are not in the new structure
  const filteredData = removeExtraKeys(mergedData, newData);

  // Sort keys for consistency
  const sortedData = sortObjectKeys(filteredData) as Record<string, unknown>;

  const originalContent = existsSync(domainFile)
    ? await readFile(domainFile, 'utf-8')
    : '';
  const newContent = JSON.stringify(sortedData, null, 2) + '\n';

  if (originalContent !== newContent) {
    if (!isDryRun) {
      await writeFile(domainFile, newContent, 'utf-8');
    }

    // Track changes for dry run output
    const existingKeys = getAllKeys(existingData);
    const newKeys = getAllKeys(sortedData);

    for (const key of newKeys) {
      if (!existingKeys.includes(key)) {
        actions.push({
          type: 'add',
          file: domainFile,
          key,
          value: getNestedValue(sortedData, key),
        });
      }
    }

    for (const key of existingKeys) {
      if (!newKeys.includes(key)) {
        actions.push({
          type: 'remove',
          file: domainFile,
          key,
        });
      }
    }

    console.log(`   ${isDryRun ? 'Would update' : 'Updated'}: ${domainFile}`);
  } else {
    console.log(`   - No changes: ${domainFile}`);
  }
}

/**
 * Get nested value from object by dotted key
 */
function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      current = (current as Record<string, unknown>)[part] as Record<
        string,
        unknown
      >;
    } else {
      return 'UNKNOWN';
    }
  }

  return typeof current === 'string' ? current : 'UNKNOWN';
}

/**
 * Add missing keys from new structure to existing data with empty strings,
 * preserving existing values
 */
function addMissingKeys(
  existing: Record<string, unknown>,
  newStructure: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...existing };

  for (const [key, value] of Object.entries(newStructure)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Nested object - recurse
      const existingValue = result[key];
      if (
        existingValue &&
        typeof existingValue === 'object' &&
        !Array.isArray(existingValue)
      ) {
        result[key] = addMissingKeys(
          existingValue as Record<string, unknown>,
          value as Record<string, unknown>
        );
      } else {
        // New nested object - copy with empty strings
        result[key] = addMissingKeys({}, value as Record<string, unknown>);
      }
    } else {
      // Primitive value - only add if key doesn't exist
      if (!(key in result)) {
        result[key] = '';
      }
      // If key exists, preserve existing value
    }
  }

  return result;
}

/**
 * Remove keys from existing data that are not in the new structure
 */
function removeExtraKeys(
  existing: Record<string, unknown>,
  newStructure: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(newStructure)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Nested object - recurse if exists in existing
      const existingValue = existing[key];
      if (
        existingValue &&
        typeof existingValue === 'object' &&
        !Array.isArray(existingValue)
      ) {
        result[key] = removeExtraKeys(
          existingValue as Record<string, unknown>,
          value as Record<string, unknown>
        );
      } else {
        // New structure has nested object, but existing doesn't - copy empty
        result[key] = value;
      }
    } else {
      // Primitive value - copy from existing if exists, otherwise from new
      if (key in existing) {
        result[key] = existing[key];
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Merge all domain-specific JSON files into single locale files
 */
async function mergeLocaleFiles(locale: string): Promise<void> {
  const localeDir = join(process.cwd(), 'src', 'locales', locale);
  const outputFile = join(process.cwd(), 'src', 'locales', `${locale}.json`);

  if (!existsSync(localeDir)) {
    console.log(`   ⚠️  Locale directory not found: ${localeDir} (skipped)`);
    return;
  }

  const files = readdirSync(localeDir)
    .filter(file => file.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.log(`   ⚠️  No JSON files found in: ${localeDir} (skipped)`);
    return;
  }

  console.log(`   📦 Merging ${files.length} files for locale: ${locale}`);

  const merged: Record<string, unknown> = {};

  for (const file of files) {
    const filePath = join(localeDir, file);
    const content = await readFile(filePath, 'utf-8');

    try {
      const json = JSON.parse(content);
      Object.assign(merged, json);
    } catch (error) {
      console.error(`   ❌ Failed to parse: ${file} - ${error}`);
      throw error;
    }
  }

  // Sort keys alphabetically for consistency
  const sorted = sortObjectKeys(merged);

  // Write merged file
  if (!isDryRun) {
    await writeFile(
      outputFile,
      JSON.stringify(sorted, null, 2) + '\n',
      'utf-8'
    );
  }
  console.log(`   ${isDryRun ? 'Would create' : 'Created'}: ${outputFile}`);
}

/**
 * Run validation script
 */
async function runValidation(): Promise<boolean> {
  console.log('\n🔍 Running validation...');

  const languages = getLanguages();
  const baseLang = 'en';

  if (!languages.includes(baseLang)) {
    console.error(`❌ Base language (${baseLang}) must exist`);
    process.exit(1);
  }

  const domains = getDomains(baseLang);

  console.log(`📂 Detected languages: ${languages.join(', ')}`);
  console.log(`📂 Detected domains: ${domains.join(', ')}\n`);

  const errors: Array<{
    type: string;
    file: string;
    key: string;
    details?: string;
  }> = [];
  const warnings: Array<{
    type: string;
    file: string;
    key: string;
    details?: string;
  }> = [];

  // Validate each domain - compare all languages against the base language (en)
  const otherLanguages = languages.filter(lang => lang !== baseLang);

  for (const domain of domains) {
    const basePath = join(
      process.cwd(),
      'src',
      'locales',
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

    console.log(`   📦 Checking ${domain}...`);

    // Compare base language against each other language
    for (const targetLang of otherLanguages) {
      const targetPath = join(
        process.cwd(),
        'src',
        'locales',
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
        domain,
        errors,
        warnings
      );
    }
  }

  // Validate merged files
  console.log('\n   📦 Checking merged files...');
  await validateMergedFiles(languages, baseLang, errors, warnings);

  // Print results
  if (errors.length === 0 && warnings.length === 0) {
    console.log('   ✅ Validation passed');
    return true;
  }

  if (errors.length > 0) {
    console.log(`   ❌ ${errors.length} Error(s):`);
    for (const error of errors) {
      console.log(`      ${error.details}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`   ⚠️  ${warnings.length} Warning(s):`);
    for (const warning of warnings) {
      console.log(`      ${warning.details}`);
    }
  }

  return errors.length === 0;
}

/**
 * Get all keys from a nested object
 */
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
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
  domain: string,
  errors: Array<{ type: string; file: string; key: string; details?: string }>,
  warnings: Array<{ type: string; file: string; key: string; details?: string }>
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
    `      ${domain}: ${sourceKeys.length} keys, ${errors.length} missing, ${warnings.length} extra`
  );
}

/**
 * Validate merged locale files
 */
async function validateMergedFiles(
  languages: string[],
  baseLang: string,
  errors: Array<{ type: string; file: string; key: string; details?: string }>,
  warnings: Array<{ type: string; file: string; key: string; details?: string }>
): Promise<void> {
  const otherLanguages = languages.filter(lang => lang !== baseLang);

  for (const targetLang of otherLanguages) {
    const baseMergedPath = join(
      process.cwd(),
      'src',
      'locales',
      `${baseLang}.json`
    );
    const targetMergedPath = join(
      process.cwd(),
      'src',
      'locales',
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
      'merged',
      errors,
      warnings
    );
  }
}

/**
 * Validate all parsed data
 */
function validateParsedData(parsedFiles: ParsedStringsFile[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const file of parsedFiles) {
    for (const constant of file.constants) {
      // Validate constant name format
      const nameValidation = validateConstantName(constant.constantName);
      if (!nameValidation.valid) {
        errors.push(
          ...nameValidation.errors.map(
            (error: string) =>
              `${file.filePath}:${constant.lineNumber}: ${error}`
          )
        );
      }

      // Validate key formats
      for (const key of constant.keys) {
        const keyValidation = validateKeyFormat(key.key);
        if (!keyValidation.valid) {
          errors.push(
            ...keyValidation.errors.map(
              (error: string) =>
                `${file.filePath}:${constant.lineNumber}: ${error}`
            )
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Main sync function
 */
async function syncStringsFirst(): Promise<void> {
  console.log(`\n🔄 Strings-first sync${isDryRun ? ' (DRY RUN)' : ''}...\n`);

  // Get all strings files
  const stringsFiles = getStringsFiles();
  console.log(`📂 Found ${stringsFiles.length} strings files:`);
  for (const file of stringsFiles) {
    console.log(`   - ${file}`);
  }
  console.log('');

  if (stringsFiles.length === 0) {
    console.log('⚠️  No strings files found. Nothing to sync.');
    return;
  }

  // Parse all strings files
  console.log('🔍 Parsing strings files...');
  const parsedFiles = await parseStringsFiles(stringsFiles);

  // Validate parsed data
  const validation = validateParsedData(parsedFiles);
  if (!validation.valid) {
    console.error('❌ Validation errors:');
    for (const error of validation.errors) {
      console.error(`   ${error}`);
    }
    process.exit(1);
  }

  // Collect all constants
  const allConstants = parsedFiles.flatMap(file => file.constants);

  // Filter out excluded constants (e.g., error codes that won't be translated)
  const filteredConstants = allConstants.filter(
    constant =>
      !EXCLUDED_CONSTANTS.some(excluded =>
        constant.constantName.endsWith(excluded)
      )
  );

  console.log(
    `📊 Found ${allConstants.length} constants across all files (${allConstants.length - filteredConstants.length} excluded)\n`
  );

  // Map constants to JSON structure
  console.log('🗺️  Mapping constants to JSON structure...');
  const mappingResult = mapConstants(filteredConstants);

  console.log(`   Standard mappings: ${mappingResult.standardMappings.length}`);
  console.log(`   Custom mappings: ${mappingResult.customMappings.length}\n`);

  // Generate JSON for each language
  const languages = getLanguages();

  for (const lang of languages) {
    console.log(`🌍 Processing language: ${lang}`);

    // Generate empty structure from standard mappings
    const standardJson = generateEmptyStructureFromMappings(
      mappingResult.standardMappings
    );

    // Apply custom mappings
    for (const customMapping of mappingResult.customMappings) {
      const { domain, category, keys } = customMapping;
      if (!standardJson[domain]) standardJson[domain] = {};
      const domainObj = standardJson[domain] as Record<string, unknown>;
      if (!domainObj[category]) domainObj[category] = {};

      const categoryObj = domainObj[category] as Record<string, unknown>;
      for (const key of keys) {
        categoryObj[key.jsonKey] = '';
      }
    }

    // Update domain files
    for (const [domain, domainData] of Object.entries(standardJson)) {
      await updateDomainJson(
        domain,
        { [domain]: domainData } as Record<string, unknown>,
        lang
      );
    }

    // Merge domain files into combined locale file
    await mergeLocaleFiles(lang);
  }

  // Sort all files
  if (!isDryRun) {
    console.log('\n🔄 Sorting all files...');
    // Import and run sort functionality
    const { sortAllI18nFiles } = await import('./sort');
    await sortAllI18nFiles();
  }

  // Run validation
  const validationPassed = await runValidation();

  // Print summary
  console.log('\n' + '='.repeat(60));

  if (actions.length === 0) {
    console.log('✅ Everything is already in sync!\n');
  } else {
    console.log(`\n${isDryRun ? '📋' : '✅'} ${actions.length} Action(s):\n`);

    const grouped = new Map<string, SyncAction[]>();
    for (const action of actions) {
      if (!grouped.has(action.file)) {
        grouped.set(action.file, []);
      }
      grouped.get(action.file)?.push(action);
    }

    for (const [file, fileActions] of grouped.entries()) {
      console.log(`   ${file}`);
      for (const action of fileActions) {
        const detailSuffix = action.detail ? ` (${action.detail})` : '';
        if (action.type === 'add') {
          console.log(
            `      + Add: ${action.key}${action.value ? ` = "${action.value}"` : ''}${detailSuffix}`
          );
        } else if (action.type === 'remove') {
          console.log(`      - Remove: ${action.key}${detailSuffix}`);
        } else {
          console.log(`      ~ Update: ${action.key}${detailSuffix}`);
        }
      }
      console.log('');
    }

    if (isDryRun) {
      console.log('🔍 Dry run - no files were modified');
    } else {
      console.log('✅ Sync complete!');
    }
  }

  if (!validationPassed) {
    console.log(
      '\n⚠️  Validation found issues. Please review the output above.'
    );
  }

  console.log('\n📝 Next steps:');
  console.log('   1. Review generated JSON files');
  console.log('   2. Add actual translations for placeholder values');
  console.log('   3. Commit changes');
}

/**
 * Main execution
 */
export async function main() {
  try {
    await syncStringsFirst();
  } catch (error) {
    console.error(
      '\n❌ Sync failed:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

// Run if called directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.includes('sync.ts')
) {
  main();
}
