#!/usr/bin/env tsx
/**
 * i18n Management Script
 *
 * Comprehensive i18n management with CRUD operations for translation keys.
 *
 * Usage:
 *   npm run i18n:manage add <key> <en-text> <hu-text>
 *   npm run i18n:manage update <key> <en-text> <hu-text>
 *   npm run i18n:manage delete <key>
 *
 * Examples:
 *   npm run i18n:manage add auth.errors.new-error "New error" "Új hiba"
 *   npm run i18n:manage update auth.success.login "Welcome!" "Üdvözöljük!"
 *   npm run i18n:manage delete auth.errors.old-error
 */
import { existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'url';

import {
  LOCALES_DIR,
  FEATURES_DIR,
  CORE_STRINGS_PATH,
  STRINGS_DIR,
  STRINGS_FILE_NAME,
} from './constants';
import { getLanguages, kebabToCamel } from './helpers';

// Domain → file mapping
export const getDomainConfig = () => {
  const config: Record<
    string,
    { locales: string; constants?: string; feature: boolean }
  > = {};

  // Common domains
  config.common = {
    locales: `${LOCALES_DIR}/{lang}/common.json`,
    constants: undefined,
    feature: false,
  };
  config.errors = {
    locales: `${LOCALES_DIR}/{lang}/errors.json`,
    constants: CORE_STRINGS_PATH,
    feature: false,
  };
  config.navigation = {
    locales: `${LOCALES_DIR}/{lang}/navigation.json`,
    constants: undefined,
    feature: false,
  };

  // Feature domains - dynamically detect from {FEATURES_DIR}/
  const featuresDir = join(process.cwd(), FEATURES_DIR);
  if (existsSync(featuresDir)) {
    const features = readdirSync(featuresDir).filter(
      dir => !dir.startsWith('.')
    );
    for (const feature of features) {
      config[feature] = {
        locales: `${LOCALES_DIR}/{lang}/${feature}.json`,
        constants: `${FEATURES_DIR}/${feature}/${STRINGS_DIR}/${STRINGS_FILE_NAME}`,
        feature: true,
      };
    }
  }

  return config;
};

// Category → constant object mapping
const CATEGORY_MAPPING: Record<string, string> = {
  errors: 'ERRORS',
  success: 'SUCCESS',
  labels: 'LABELS',
  warnings: 'WARNINGS',
  info: 'INFO',
};

interface ParsedKey {
  domain: string;
  category: string;
  key: string;
  fullPath: string[];
}

/**
 * Parse i18n key into components
 * Example: "auth.errors.new-error" → { domain: "auth", category: "errors", key: "new-error" }
 * Special case: "errors.not-found" → { domain: "errors", category: "errors", key: "not-found" }
 */
export function parseKey(key: string): ParsedKey {
  const parts = key.split('.');

  // Special handling for 'errors' domain (flat structure)
  if (parts[0] === 'errors') {
    if (parts.length < 2) {
      throw new Error(
        `Invalid key format for errors domain. Expected: errors.key (e.g., errors.not-found)`
      );
    }

    const domain = parts[0];
    const keyName = parts.slice(1).join('.');

    if (!domain) {
      throw new Error(`Domain is required.`);
    }

    return {
      domain,
      category: 'errors', // Use 'errors' as pseudo-category for flat structure
      key: keyName,
      fullPath: parts,
    };
  }

  // Standard nested structure (auth, bookmarks, etc.)
  if (parts.length < 3) {
    throw new Error(
      `Invalid key format. Expected: domain.category.key (e.g., auth.errors.invalid-email)`
    );
  }

  const domain = parts[0];
  const category = parts[1];
  const rest = parts.slice(2);

  if (!domain || !category) {
    throw new Error(`Invalid key format. Domain and category are required.`);
  }

  return {
    domain,
    category,
    key: rest.join('.'),
    fullPath: parts,
  };
}

/**
 * Remove the domain prefix from a translation key
 */
export function getRelativeKey(fullKey: string, domain: string): string {
  const prefix = `${domain}.`;
  if (fullKey.startsWith(prefix)) {
    return fullKey.slice(prefix.length);
  }

  return fullKey;
}

/**
 * Convert domain.category to constant name
 * Example: "auth.errors" → "AUTH_ERRORS"
 * Special: "errors.errors" → "CORE_ERRORS" (flat errors domain)
 */
export function getConstantName(domain: string, category: string): string {
  // Special handling for 'errors' domain
  if (domain === 'errors') {
    return 'CORE_ERRORS';
  }

  const categoryName = CATEGORY_MAPPING[category] || category.toUpperCase();
  return `${domain.toUpperCase()}_${categoryName}`;
}

/**
 * Sort object keys alphabetically (recursive)
 */
export function sortObjectKeys(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }

  return sorted;
}

/**
 * Add key to JSON file (locales)
 */
export async function addToLocaleFile(
  filePath: string,
  parsedKey: ParsedKey,
  text: string
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const json = JSON.parse(content);

  // Navigate to the correct nested object
  let current: Record<string, unknown> = json;
  for (let i = 0; i < parsedKey.fullPath.length - 1; i++) {
    const part = parsedKey.fullPath[i];
    if (!part) continue;
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  // Add the key
  const finalKey = parsedKey.key;
  if (current[finalKey]) {
    throw new Error(
      `Key "${parsedKey.fullPath.join('.')}" already exists in ${filePath}`
    );
  }

  current[finalKey] = text;

  // Sort keys alphabetically
  const sorted = sortObjectKeys(current);
  const parentKey = parsedKey.fullPath[parsedKey.fullPath.length - 2];
  if (!parentKey) {
    throw new Error('Invalid key path');
  }
  let parent: Record<string, unknown> = json;
  for (let i = 0; i < parsedKey.fullPath.length - 2; i++) {
    const pathPart = parsedKey.fullPath[i];
    if (!pathPart) continue;
    parent = parent[pathPart] as Record<string, unknown>;
  }
  parent[parentKey] = sorted;

  // Write back with proper formatting
  await writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
}

/**
 * Update key in JSON file (locales)
 */
export async function updateLocaleFile(
  filePath: string,
  parsedKey: ParsedKey,
  text: string
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const json = JSON.parse(content);

  // Navigate to the correct nested object
  let current: Record<string, unknown> = json;
  for (let i = 0; i < parsedKey.fullPath.length - 1; i++) {
    const part = parsedKey.fullPath[i];
    if (!part) continue;
    if (!current[part] || typeof current[part] !== 'object') {
      throw new Error(
        `Key path "${parsedKey.fullPath.slice(0, i + 1).join('.')}" not found in ${filePath}`
      );
    }
    current = current[part] as Record<string, unknown>;
  }

  // Update the key
  const finalKey = parsedKey.key;
  if (!current[finalKey]) {
    throw new Error(
      `Key "${parsedKey.fullPath.join('.')}" not found in ${filePath}`
    );
  }

  current[finalKey] = text;

  // Write back with proper formatting
  await writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
}

/**
 * Delete key from JSON file (locales)
 */
export async function deleteFromLocaleFile(
  filePath: string,
  parsedKey: ParsedKey
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const json = JSON.parse(content);

  // Navigate to the correct nested object
  let current: Record<string, unknown> = json;
  for (let i = 0; i < parsedKey.fullPath.length - 1; i++) {
    const part = parsedKey.fullPath[i];
    if (!part) continue;
    if (!current[part] || typeof current[part] !== 'object') {
      throw new Error(
        `Key path "${parsedKey.fullPath.slice(0, i + 1).join('.')}" not found in ${filePath}`
      );
    }
    current = current[part] as Record<string, unknown>;
  }

  // Delete the key
  const finalKey = parsedKey.key;
  if (!current[finalKey]) {
    throw new Error(
      `Key "${parsedKey.fullPath.join('.')}" not found in ${filePath}`
    );
  }

  delete current[finalKey];

  // Write back with proper formatting
  await writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
}

/**
 * Add key to TypeScript constants file
 */
export async function addToConstantsFile(
  filePath: string,
  parsedKey: ParsedKey
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const constantName = getConstantName(parsedKey.domain, parsedKey.category);
  const propertyName = kebabToCamel(parsedKey.key);
  const fullKey = parsedKey.fullPath.join('.');
  const relativeKey = getRelativeKey(fullKey, parsedKey.domain);

  // Find the constant object
  const regex = new RegExp(
    `export const ${constantName} = \\{([\\s\\S]*?)\\} as const;`,
    'm'
  );
  const match = content.match(regex);

  if (!match) {
    // Create new constant object
    const newConstant = `
/**
 * ${parsedKey.domain.charAt(0).toUpperCase() + parsedKey.domain.slice(1)} ${parsedKey.category} messages (i18n keys)
 */
export const ${constantName} = {
    ${propertyName}: '${relativeKey}',
} as const;
`;

    // Add before the last export or at the end
    const updatedContent = content + '\n' + newConstant;
    await writeFile(filePath, updatedContent, 'utf-8');
    return;
  }

  // Parse existing properties
  const propsContent = match[1];
  if (!propsContent) {
    throw new Error(`Could not parse constant ${constantName} in ${filePath}`);
  }

  // Extract property definitions (key: value pairs)
  const existingProps: Array<{ key: string; value: string }> = [];
  const lines = propsContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    const match = trimmed.match(/^(\w+):\s*'([^']+)',?$/);
    if (match) {
      const [, key, value] = match;
      if (key && value) {
        existingProps.push({ key, value });
      }
    }
  }

  // Add new property
  existingProps.push({ key: propertyName, value: relativeKey });

  // Sort properties alphabetically by key
  const sortedProps = existingProps.sort((a, b) => a.key.localeCompare(b.key));

  // Reconstruct constant with proper formatting
  const propsLines = sortedProps.map(
    ({ key, value }) => `  ${key}: '${value}',`
  );
  const newContent = `export const ${constantName} = {
${propsLines.join('\n')}
} as const;`;

  // Replace in content
  const updatedContent = content.replace(regex, newContent);
  await writeFile(filePath, updatedContent, 'utf-8');
}

/**
 * Delete key from TypeScript constants file
 */
export async function deleteFromConstantsFile(
  filePath: string,
  parsedKey: ParsedKey
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const constantName = getConstantName(parsedKey.domain, parsedKey.category);
  const propertyName = kebabToCamel(parsedKey.key);

  // Find the constant object
  const regex = new RegExp(
    `export const ${constantName} = \\{([\\s\\S]*?)\\} as const;`,
    'm'
  );
  const match = content.match(regex);

  if (!match) {
    throw new Error(`Constant ${constantName} not found in ${filePath}`);
  }

  // Parse existing properties
  const propsContent = match[1];
  if (!propsContent) {
    throw new Error(`Could not parse constant ${constantName} in ${filePath}`);
  }

  // Extract property definitions (key: value pairs)
  const existingProps: Array<{ key: string; value: string }> = [];
  const lines = propsContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    const match = trimmed.match(/^(\w+):\s*'([^']+)',?$/);
    if (match) {
      const [, key, value] = match;
      if (key && value) {
        existingProps.push({ key, value });
      }
    }
  }

  // Remove the property
  const filteredProps = existingProps.filter(prop => prop.key !== propertyName);

  if (filteredProps.length === existingProps.length) {
    throw new Error(
      `Property ${propertyName} not found in constant ${constantName}`
    );
  }

  // Reconstruct constant with proper formatting
  const propsLines = filteredProps.map(
    ({ key, value }) => `  ${key}: '${value}',`
  );
  const newContent = `export const ${constantName} = {
${propsLines.join('\n')}
} as const;`;

  // Replace in content
  const updatedContent = content.replace(regex, newContent);
  await writeFile(filePath, updatedContent, 'utf-8');
}

/**
 * Execute add operation
 */
async function executeAdd(
  key: string,
  enText: string,
  huText: string
): Promise<void> {
  const parsedKey = parseKey(key);
  console.log(`\n📦 Adding key: ${key}`);
  console.log(`   Domain: ${parsedKey.domain}`);
  console.log(`   Category: ${parsedKey.category}`);
  console.log(`   Key: ${parsedKey.key}\n`);

  // Check if domain exists
  const DOMAIN_CONFIG = getDomainConfig();
  let domainConfig = DOMAIN_CONFIG[parsedKey.domain];
  if (!domainConfig) {
    console.log(
      `⚠️  Domain '${parsedKey.domain}' not in config, assuming feature domain...`
    );
    domainConfig = {
      locales: `${LOCALES_DIR}/{lang}/${parsedKey.domain}.json`,
      constants: `${FEATURES_DIR}/${parsedKey.domain}/${STRINGS_DIR}/${STRINGS_FILE_NAME}`,
      feature: true,
    };
  }

  // Add to all language locales
  const languages = getLanguages();
  const texts: Record<string, string> = { en: enText, hu: huText };

  for (const lang of languages) {
    const langPath = join(
      process.cwd(),
      domainConfig.locales.replace('{lang}', lang)
    );
    if (!existsSync(langPath)) {
      throw new Error(`File not found: ${langPath}`);
    }
    const text = texts[lang];
    if (!text) {
      throw new Error(`No text provided for language: ${lang}`);
    }
    await addToLocaleFile(langPath, parsedKey, text);
    console.log(`✅ Added to ${langPath}`);
  }

  // Add to TypeScript constants (if exists)
  if (domainConfig.constants) {
    const constantsPath = join(process.cwd(), domainConfig.constants);
    if (existsSync(constantsPath)) {
      await addToConstantsFile(constantsPath, parsedKey);
      const constantName = getConstantName(
        parsedKey.domain,
        parsedKey.category
      );
      const propertyName = kebabToCamel(parsedKey.key);
      console.log(
        `✅ Added to ${constantsPath} (${constantName}.${propertyName})`
      );
    } else {
      console.log(`⚠️  Constants file not found: ${constantsPath} (skipped)`);
    }
  }

  console.log(`\n✨ Done! Use it in your code:`);
  const constantName = getConstantName(parsedKey.domain, parsedKey.category);
  const propertyName = kebabToCamel(parsedKey.key);
  console.log(`   ${constantName}.${propertyName}`);
}

/**
 * Execute update operation
 */
async function executeUpdate(
  key: string,
  enText: string,
  huText: string
): Promise<void> {
  const parsedKey = parseKey(key);
  console.log(`\n📝 Updating key: ${key}`);
  console.log(`   Domain: ${parsedKey.domain}`);
  console.log(`   Category: ${parsedKey.category}`);
  console.log(`   Key: ${parsedKey.key}\n`);

  // Check if domain exists
  const DOMAIN_CONFIG = getDomainConfig();
  let domainConfig = DOMAIN_CONFIG[parsedKey.domain];
  if (!domainConfig) {
    console.log(
      `⚠️  Domain '${parsedKey.domain}' not in config, assuming feature domain...`
    );
    domainConfig = {
      locales: `${LOCALES_DIR}/{lang}/${parsedKey.domain}.json`,
      constants: `${FEATURES_DIR}/${parsedKey.domain}/${STRINGS_DIR}/${STRINGS_FILE_NAME}`,
      feature: true,
    };
  }

  // Update in all language locales
  const languages = getLanguages();
  const texts: Record<string, string> = { en: enText, hu: huText };

  for (const lang of languages) {
    const langPath = join(
      process.cwd(),
      domainConfig.locales.replace('{lang}', lang)
    );
    if (!existsSync(langPath)) {
      throw new Error(`File not found: ${langPath}`);
    }
    const text = texts[lang];
    if (!text) {
      throw new Error(`No text provided for language: ${lang}`);
    }
    await updateLocaleFile(langPath, parsedKey, text);
    console.log(`✅ Updated in ${langPath}`);
  }

  console.log(`\n✨ Done! Key updated successfully.`);
}

/**
 * Execute delete operation
 */
async function executeDelete(key: string): Promise<void> {
  const parsedKey = parseKey(key);
  console.log(`\n🗑️  Deleting key: ${key}`);
  console.log(`   Domain: ${parsedKey.domain}`);
  console.log(`   Category: ${parsedKey.category}`);
  console.log(`   Key: ${parsedKey.key}\n`);

  // Check if domain exists
  const DOMAIN_CONFIG = getDomainConfig();
  let domainConfig = DOMAIN_CONFIG[parsedKey.domain];
  if (!domainConfig) {
    console.log(
      `⚠️  Domain '${parsedKey.domain}' not in config, assuming feature domain...`
    );
    domainConfig = {
      locales: `${LOCALES_DIR}/{lang}/${parsedKey.domain}.json`,
      constants: `${FEATURES_DIR}/${parsedKey.domain}/${STRINGS_DIR}/${STRINGS_FILE_NAME}`,
      feature: true,
    };
  }

  // Delete from all language locales
  const languages = getLanguages();

  for (const lang of languages) {
    const langPath = join(
      process.cwd(),
      domainConfig.locales.replace('{lang}', lang)
    );
    if (!existsSync(langPath)) {
      throw new Error(`File not found: ${langPath}`);
    }
    await deleteFromLocaleFile(langPath, parsedKey);
    console.log(`✅ Deleted from ${langPath}`);
  }

  // Delete from TypeScript constants (if exists)
  if (domainConfig.constants) {
    const constantsPath = join(process.cwd(), domainConfig.constants);
    if (existsSync(constantsPath)) {
      await deleteFromConstantsFile(constantsPath, parsedKey);
      const constantName = getConstantName(
        parsedKey.domain,
        parsedKey.category
      );
      const propertyName = kebabToCamel(parsedKey.key);
      console.log(
        `✅ Deleted from ${constantsPath} (${constantName}.${propertyName})`
      );
    } else {
      console.log(`⚠️  Constants file not found: ${constantsPath} (skipped)`);
    }
  }

  console.log(`\n✨ Done! Key deleted successfully.`);
}

/**
 * Main function
 */
export async function main() {
  const [command, key, ...restArgs] = process.argv.slice(2);

  if (!command || !key) {
    console.error('❌ Command and key are required!');
    console.error('\nUsage:');
    console.error('  npm run i18n:manage add <key> <en-text> <hu-text>');
    console.error('  npm run i18n:manage update <key> <en-text> <hu-text>');
    console.error('  npm run i18n:manage delete <key>');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'add': {
        if (restArgs.length !== 2) {
          throw new Error('Add command requires <en-text> <hu-text> arguments');
        }
        const [enText, huText] = restArgs;
        if (!enText || !huText) {
          throw new Error('Both English and Hungarian text are required');
        }
        await executeAdd(key, enText, huText);
        break;
      }

      case 'update': {
        if (restArgs.length !== 2) {
          throw new Error(
            'Update command requires <en-text> <hu-text> arguments'
          );
        }
        const [updateEnText, updateHuText] = restArgs;
        if (!updateEnText || !updateHuText) {
          throw new Error('Both English and Hungarian text are required');
        }
        await executeUpdate(key, updateEnText, updateHuText);
        break;
      }

      case 'delete': {
        if (restArgs.length !== 0) {
          throw new Error('Delete command requires no additional arguments');
        }
        if (!key) {
          throw new Error('Key is required for delete operation');
        }
        await executeDelete(key);
        break;
      }

      default:
        throw new Error(
          `Unknown command: ${command}. Supported: add, update, delete`
        );
    }
  } catch (error) {
    console.error(
      '\n❌ Error:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

// Only run main if this file is executed directly (not imported)
const __filename = fileURLToPath(import.meta.url);
if (__filename === process.argv[1]) {
  console.log('🚀 Starting i18n manage script...');
  main();
}
