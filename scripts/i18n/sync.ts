#!/usr/bin/env tsx
/**
 * i18n Sync Script
 *
 * Synchronizes translation files:
 * - Adds missing Hungarian translations with [HU] placeholders
 * - Removes extra Hungarian translations not in English
 * - Updates TypeScript constants to match JSON files
 *
 * Usage:
 *   npm run i18n:sync
 *   npm run i18n:sync --dry-run  # Preview changes without applying
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { LOCALES_DIR } from './constants';
import {
  getLanguages,
  getDomains,
  getConstantsPath,
  kebabToCamel,
  getLabelSuffixRank,
} from './helpers';
import { sortAllI18nFiles, sortObjectKeys, compareLabelKeys } from './sort';

const isDryRun = process.argv.includes('--dry-run');

interface SyncAction {
  type: 'add' | 'remove' | 'update' | 'missing';
  file: string;
  key: string;
  value?: string;
  detail?: string;
}

const actions: SyncAction[] = [];

/**
 * Get all keys from a nested object with their values
 */
function getAllKeysWithValues(
  obj: Record<string, unknown>,
  prefix = ''
): Array<{ key: string; value: unknown }> {
  const result: Array<{ key: string; value: unknown }> = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result.push(
        ...getAllKeysWithValues(value as Record<string, unknown>, fullKey)
      );
    } else {
      result.push({ key: fullKey, value });
    }
  }

  return result;
}

/**
 * Set nested property in object
 */
function setNestedProperty(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!part) continue;
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    current[lastPart] = value;
  }
}

/**
 * Remove nested property from object
 */
function removeNestedProperty(
  obj: Record<string, unknown>,
  path: string
): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!part || !current[part]) return;
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    delete current[lastPart];
  }
}

/**
 * Remove the domain prefix from a translation key
 */
function getRelativeKey(fullKey: string, domain: string): string {
  const prefix = `${domain}.`;
  if (fullKey.startsWith(prefix)) {
    return fullKey.slice(prefix.length);
  }

  return fullKey;
}

/**
 * Sync locale files (EN → HU)
 */
async function syncLocaleFiles(
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

  const sourceKeys = getAllKeysWithValues(sourceJson);
  const targetKeys = getAllKeysWithValues(targetJson);

  let changed = false;

  // Add missing keys to target
  for (const { key, value } of sourceKeys) {
    const targetHasKey = targetKeys.some(item => item.key === key);

    if (!targetHasKey) {
      const placeholder = `[${targetLang.toUpperCase()}] ${value}`;
      setNestedProperty(targetJson, key, placeholder);
      actions.push({
        type: 'add',
        file: targetPath,
        key,
        value: placeholder,
      });
      changed = true;
    }
  }

  // Remove extra keys from target
  const sourceKeyStrings = sourceKeys.map(item => item.key);
  for (const { key } of targetKeys) {
    if (!sourceKeyStrings.includes(key)) {
      removeNestedProperty(targetJson, key);
      actions.push({
        type: 'remove',
        file: targetPath,
        key,
      });
      changed = true;
    }
  }

  // Write back if changed
  if (changed && !isDryRun) {
    const sorted = sortObjectKeys(targetJson);
    await writeFile(
      targetPath,
      JSON.stringify(sorted, null, 2) + '\n',
      'utf-8'
    );
  }

  console.log(
    `   ${domain}: ${actions.filter(a => a.file === targetPath).length} changes`
  );
}

function mergeConstantLines(
  lines: string[],
  desired: Map<string, string>
): {
  lines: string[];
  changed: boolean;
  changes: Array<{
    key: string;
    type: 'update';
    oldValue?: string;
    newValue: string;
  }>;
  missing: Array<{ key: string; newValue: string }>;
} {
  const updatedLines: string[] = [];
  const changes: Array<{
    key: string;
    type: 'update';
    oldValue?: string;
    newValue: string;
  }> = [];
  const missing: Array<{ key: string; newValue: string }> = [];
  let changed = false;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const trimmed = line.trim();

    const singleLineMatch = trimmed.match(/^([A-Za-z0-9_]+):\s*'([^']+)',?$/);
    if (singleLineMatch) {
      const key = singleLineMatch[1] as string;
      const value = singleLineMatch[2] as string;
      const existingValue = desired.get(key);
      if (existingValue !== undefined) {
        desired.delete(key);
        if (existingValue !== value) {
          changed = true;
          changes.push({
            key,
            type: 'update',
            oldValue: value,
            newValue: existingValue,
          });
          const indent = line.slice(0, line.indexOf(trimmed));
          updatedLines.push(`${indent}${key}: '${existingValue}',`);
          continue;
        }
      }
    }

    const multiLineKeyMatch = trimmed.match(/^([A-Za-z0-9_]+):$/);
    if (multiLineKeyMatch && index + 1 < lines.length) {
      const nextLine = lines[index + 1]!;
      const nextTrimmed = nextLine.trim();
      const multiLineValueMatch = nextTrimmed.match(/^'([^']+)',?$/);

      if (multiLineValueMatch) {
        const key = multiLineKeyMatch[1] as string;
        const value = multiLineValueMatch[1] as string;
        const existingValue = desired.get(key);
        if (existingValue !== undefined) {
          desired.delete(key);
          updatedLines.push(line);
          if (existingValue !== value) {
            changed = true;
            changes.push({
              key,
              type: 'update',
              oldValue: value,
              newValue: existingValue,
            });
            const indent = nextLine.slice(0, nextLine.indexOf(nextTrimmed));
            updatedLines.push(`${indent}'${existingValue}',`);
          } else {
            updatedLines.push(nextLine);
          }
          index += 1;
          continue;
        }
      }
    }

    updatedLines.push(line);
  }

  if (desired.size > 0) {
    for (const [key, value] of desired.entries()) {
      missing.push({ key, newValue: value });
    }
  }

  return { lines: updatedLines, changed, changes, missing };
}

/**
 * Sync flat constants (for 'errors' domain)
 */
async function syncFlatConstants(
  constantsPath: string,
  localeKeys: Array<{ key: string; value: unknown }>,
  domain: string,
  constantsContent: string
): Promise<void> {
  const constantName = `CORE_${domain.toUpperCase()}`;

  // Extract keys (remove domain prefix)
  const keys = localeKeys
    .map(({ key }) => {
      const parts = key.split('.');
      if (parts.length < 2) return null;
      const keyName = parts.slice(1).join('-'); // errors.not-found → not-found
      return { key: keyName, value: getRelativeKey(key, domain) };
    })
    .filter((item): item is { key: string; value: string } => item !== null);

  // Check if constant exists
  const regex = new RegExp(
    `export const ${constantName} = \\{([\\s\\S]*?)\\} as const;`,
    'm'
  );
  const match = constantsContent.match(regex);

  if (!match) {
    console.log(`   ⚠️  Constant ${constantName} not found, skipping sync`);
    return;
  }

  const camelizedEntries = [...keys]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, value }) => [kebabToCamel(key), value] as const);
  const body = match[1] as string;
  const lines = body.split(/\r?\n/);
  const {
    lines: mergedLines,
    changed,
    changes,
    missing,
  } = mergeConstantLines(lines, new Map(camelizedEntries));

  if (missing.length > 0) {
    for (const item of missing) {
      actions.push({
        type: 'missing',
        file: constantsPath,
        key: `${constantName}.${item.key}`,
        detail: `key ${item.key} not present in ${constantName}`,
        value: item.newValue,
      });
    }
  }

  if (!changed) {
    return;
  }

  const newProps = mergedLines.join('\n');
  const newConstant = `export const ${constantName} = {
${newProps}
} as const;`;
  const updatedContent = constantsContent.replace(regex, newConstant);
  if (!isDryRun) {
    await writeFile(constantsPath, updatedContent, 'utf-8');
  }
  for (const change of changes) {
    actions.push({
      type: 'update',
      file: constantsPath,
      key: `${constantName}.${change.key}`,
      detail: `${change.key}: ${change.oldValue} → ${change.newValue}`,
      value: change.newValue,
    });
  }
}

/**
 * Extract last part of key (after last dot)
 */
function getKeyName(fullKey: string): string {
  const parts = fullKey.split('.');
  return parts[parts.length - 1] || fullKey;
}

function addLabelGroupSeparators(lines: string[]): string[] {
  const result: string[] = [];
  let prevRank: number | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^([A-Za-z0-9_]+):/);
    if (match) {
      const rank = getLabelSuffixRank(match[1]!);
      if (prevRank !== null && rank !== prevRank) {
        result.push('');
      }
      prevRank = rank;
    }
    result.push(line);
  }

  return result;
}

/**
 * Sync TypeScript constants file
 */
async function syncConstants(
  constantsPath: string,
  localePath: string,
  domain: string
): Promise<void> {
  if (!existsSync(constantsPath)) {
    console.log(`   ⚠️  Constants file not found: ${constantsPath}`);
    return;
  }

  const constantsContent = await readFile(constantsPath, 'utf-8');
  const localeContent = await readFile(localePath, 'utf-8');

  const localeJson = JSON.parse(localeContent);
  const localeKeys = getAllKeysWithValues(localeJson);

  // Special handling for 'errors' domain (flat structure)
  if (domain === 'errors') {
    await syncFlatConstants(
      constantsPath,
      localeKeys,
      domain,
      constantsContent
    );
    return;
  }

  // Group keys by category (errors, success, labels, etc.) for nested structures
  const categorized = new Map<string, Array<{ key: string; value: string }>>();

  for (const { key } of localeKeys) {
    const parts = key.split('.');
    if (parts.length < 3) continue; // Need domain.category.key

    const category = parts[1]; // e.g., "errors", "success", "labels"
    if (!category) continue;

    if (!categorized.has(category)) {
      categorized.set(category, []);
    }

    categorized.get(category)?.push({
      key: getKeyName(key),
      value: getRelativeKey(key, domain),
    });
  }

  // Update constants file
  let updatedContent = constantsContent;
  let changed = false;

  for (const [category, keys] of categorized.entries()) {
    const constantName = `${domain.toUpperCase()}_${category.toUpperCase()}`;
    const compareEntries =
      category === 'labels'
        ? (a: { key: string }, b: { key: string }) =>
            compareLabelKeys(a.key, b.key)
        : (a: { key: string }, b: { key: string }) =>
            a.key.localeCompare(b.key);
    const sortedKeys = [...keys].sort(compareEntries);

    // Check if constant exists
    const regex = new RegExp(
      `export const ${constantName} = \\{([\\s\\S]*?)\\} as const;`,
      'm'
    );
    const match = updatedContent.match(regex);

    if (!match) {
      // Create new constant
      const propsLines = sortedKeys.map(
        ({ key, value }) => `  ${kebabToCamel(key)}: '${value}',`
      );
      const propsWithSeparators =
        category === 'labels'
          ? addLabelGroupSeparators(propsLines)
          : propsLines;
      const props = propsWithSeparators.join('\n');

      const newConstant = `
/**
 * ${domain.charAt(0).toUpperCase() + domain.slice(1)} ${category} messages (i18n keys)
 */
export const ${constantName} = {
${props}
} as const;
`;

      updatedContent += '\n' + newConstant;
      actions.push({
        type: 'add',
        file: constantsPath,
        key: constantName,
      });
      changed = true;
    } else {
      // Update existing constant
      const camelizedEntries = sortedKeys.map(
        ({ key, value }) => [kebabToCamel(key), value] as const
      );

      const body = match[1] as string;
      const lines = body.split(/\r?\n/);
      const {
        lines: mergedLines,
        changed: hasChanges,
        changes,
        missing,
      } = mergeConstantLines(lines, new Map(camelizedEntries));

      if (missing.length > 0) {
        for (const item of missing) {
          actions.push({
            type: 'missing',
            file: constantsPath,
            key: `${constantName}.${item.key}`,
            detail: `key ${item.key} not present in ${constantName}`,
            value: item.newValue,
          });
        }
      }

      if (hasChanges) {
        const processedLines =
          category === 'labels'
            ? addLabelGroupSeparators(mergedLines)
            : mergedLines;
        const newProps = processedLines.join('\n');
        const newConstant = `export const ${constantName} = {
${newProps}
} as const;`;
        updatedContent = updatedContent.replace(regex, newConstant);
        for (const change of changes) {
          actions.push({
            type: change.type,
            file: constantsPath,
            key: `${constantName}.${change.key}`,
            detail: `${change.key}: ${change.oldValue} → ${change.newValue}`,
            value: change.newValue,
          });
        }
        changed = true;
      }
    }
  }

  // Write back if changed
  if (changed && !isDryRun) {
    await writeFile(constantsPath, updatedContent, 'utf-8');
  }
}

async function runMergeScript(): Promise<void> {
  console.log(
    '🔗 Running i18n merge to regenerate the combined locale files...'
  );
  return new Promise((resolve, reject) => {
    const mergeProcess = spawn('npm', ['run', 'i18n:merge'], {
      stdio: 'inherit',
      shell: true,
    });

    mergeProcess.on('close', code => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`i18n merge exited with status ${code}`));
    });

    mergeProcess.on('error', error => reject(error));
  });
}

async function runValidateScript(): Promise<void> {
  console.log('� Running i18n validate to check for any issues...');
  return new Promise((resolve, reject) => {
    const validateProcess = spawn('npm', ['run', 'i18n:validate'], {
      stdio: 'inherit',
      shell: true,
    });

    validateProcess.on('close', code => {
      if (code === 0) {
        resolve();
        return;
      }
      console.log(`⚠️  Validation found issues (exit code: ${code})`);
      resolve(); // Don't fail the sync, just warn
    });

    validateProcess.on('error', error => reject(error));
  });
}

/**
 * Main function
 */
async function main() {
  console.log(`\n🔄 Syncing i18n files${isDryRun ? ' (DRY RUN)' : ''}...\n`);

  const languages = getLanguages();
  const enIndex = languages.indexOf('en');
  const huIndex = languages.indexOf('hu');

  if (enIndex === -1 || huIndex === -1) {
    console.error('❌ English and Hungarian languages must exist');
    process.exit(1);
  }

  const domains = getDomains('en');

  // Sync each domain
  for (const domain of domains) {
    const enPath = join(process.cwd(), LOCALES_DIR, 'en', `${domain}.json`);
    const huPath = join(process.cwd(), LOCALES_DIR, 'hu', `${domain}.json`);

    console.log(`📦 Syncing ${domain}...`);

    // Sync EN → HU
    await syncLocaleFiles(enPath, huPath, 'en', 'hu', domain);

    // Sync constants (if exists)
    const constantsPath = getConstantsPath(domain);

    if (constantsPath && existsSync(constantsPath)) {
      await syncConstants(constantsPath, enPath, domain);
    }
  }

  // Print results
  if (!isDryRun) {
    await sortAllI18nFiles();
  }
  console.log('\n' + '='.repeat(60));

  if (actions.length === 0) {
    console.log('✅ Everything is already in sync!\n');
    if (!isDryRun) {
      await runValidateScript();
      await runMergeScript();
    }
    return;
  }

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
          `      + Add: ${action.key}${action.value ? ` = ${action.value}` : ''}${detailSuffix}`
        );
      } else if (action.type === 'remove') {
        console.log(`      - Remove: ${action.key}${detailSuffix}`);
      } else if (action.type === 'missing') {
        console.log(`      ! Missing: ${action.key}${detailSuffix}`);
      } else {
        console.log(`      ~ Update: ${action.key}${detailSuffix}`);
      }
    }
    console.log('');
  }

  if (isDryRun) {
    console.log('🔍 Dry run - no files were modified');
    console.log('   Run without --dry-run to apply changes\n');
  } else {
    console.log('✅ Sync complete!\n');
    await runValidateScript();
    await runMergeScript();
  }
}

main();
