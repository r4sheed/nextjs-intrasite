#!/usr/bin/env tsx
/**
 * i18n Add Script
 *
 * Adds a new translation key to all required files:
 * - src/locales/en/{domain}.json
 * - src/locales/hu/{domain}.json
 * - src/features/{domain}/lib/strings.ts (if feature exists)
 *
 * Usage:
 *   npm run i18n:add <key> <en-text> <hu-text>
 *   npm run i18n:add  # Interactive mode
 *
 * Examples:
 *   npm run i18n:add auth.errors.new-error "English text" "Magyar szöveg"
 *   npm run i18n:add bookmarks.success.created "Bookmark created" "Könyvjelző létrehozva"
 */
import { existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import readline from 'node:readline/promises';

// Domain → file mapping
const getDomainConfig = () => {
  const config: Record<
    string,
    { locales: string; constants?: string; feature: boolean }
  > = {};

  // Common domains
  config.common = {
    locales: 'src/locales/{lang}/common.json',
    constants: undefined,
    feature: false,
  };
  config.errors = {
    locales: 'src/locales/{lang}/errors.json',
    constants: 'src/lib/errors/messages.ts',
    feature: false,
  };
  config.navigation = {
    locales: 'src/locales/{lang}/navigation.json',
    constants: undefined,
    feature: false,
  };

  // Feature domains - dynamically detect from src/features/
  const featuresDir = join(process.cwd(), 'src/features');
  if (existsSync(featuresDir)) {
    const features = readdirSync(featuresDir).filter(
      dir => !dir.startsWith('.')
    );
    for (const feature of features) {
      config[feature] = {
        locales: `src/locales/{lang}/${feature}.json`,
        constants: `src/features/${feature}/lib/strings.ts`,
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
function parseKey(key: string): ParsedKey {
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
 * Convert kebab-case to camelCase
 * Example: "new-error" → "newError"
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert domain.category to constant name
 * Example: "auth.errors" → "AUTH_ERRORS"
 * Special: "errors.errors" → "CORE_ERRORS" (flat errors domain)
 */
function getConstantName(domain: string, category: string): string {
  // Special handling for 'errors' domain
  if (domain === 'errors') {
    return 'CORE_ERRORS';
  }

  const categoryName = CATEGORY_MAPPING[category] || category.toUpperCase();
  return `${domain.toUpperCase()}_${categoryName}`;
}

/**
 * Add key to JSON file (locales)
 */
async function addToLocaleFile(
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
 * Sort object keys alphabetically (recursive)
 */
function sortObjectKeys(obj: unknown): unknown {
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
 * Add key to TypeScript constants file
 */
async function addToConstantsFile(
  filePath: string,
  parsedKey: ParsedKey
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const constantName = getConstantName(parsedKey.domain, parsedKey.category);
  const propertyName = kebabToCamel(parsedKey.key);
  const fullKey = parsedKey.fullPath.join('.');

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
  ${propertyName}: '${fullKey}',
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
  existingProps.push({ key: propertyName, value: fullKey });

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
 * Interactive mode - prompt user for input
 */
async function interactiveMode(): Promise<{
  key: string;
  enText: string;
  huText: string;
}> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n📝 Interactive i18n Key Addition\n');

  const domain = await rl.question('Domain (e.g., auth, bookmarks): ');
  const category = await rl.question(
    'Category (errors/success/labels/warnings/info): '
  );
  const key = await rl.question('Key (kebab-case, e.g., new-error): ');
  const enText = await rl.question('English text: ');
  const huText = await rl.question('Hungarian text: ');

  rl.close();

  return {
    key: `${domain}.${category}.${key}`,
    enText,
    huText,
  };
}

/**
 * Main function
 */
async function main() {
  let key: string;
  let enText: string;
  let huText: string;

  // Parse arguments
  if (process.argv.length < 3) {
    // Interactive mode
    const input = await interactiveMode();
    key = input.key;
    enText = input.enText;
    huText = input.huText;
  } else if (process.argv.length === 5) {
    // CLI mode
    key = process.argv[2] || '';
    enText = process.argv[3] || '';
    huText = process.argv[4] || '';

    if (!key || !enText || !huText) {
      throw new Error('All arguments are required');
    }
  } else {
    console.error('❌ Invalid arguments!');
    console.error('\nUsage:');
    console.error('  npm run i18n:add <key> <en-text> <hu-text>');
    console.error('  npm run i18n:add  # Interactive mode');
    console.error('\nExample:');
    console.error(
      '  npm run i18n:add auth.errors.new-error "English text" "Magyar szöveg"'
    );
    process.exit(1);
  }

  try {
    // Parse key
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
        locales: `src/locales/{lang}/${parsedKey.domain}.json`,
        constants: `src/features/${parsedKey.domain}/lib/strings.ts`,
        feature: true,
      };
    }

    // Add to English locale
    const enPath = join(
      process.cwd(),
      domainConfig.locales.replace('{lang}', 'en')
    );
    if (!existsSync(enPath)) {
      console.error(`❌ File not found: ${enPath}`);
      console.error(
        `   Run: npm run feature:create ${parsedKey.domain} (if it's a feature)`
      );
      process.exit(1);
    }
    await addToLocaleFile(enPath, parsedKey, enText);
    console.log(`✅ Added to ${enPath}`);

    // Add to Hungarian locale
    const huPath = join(
      process.cwd(),
      domainConfig.locales.replace('{lang}', 'hu')
    );
    if (!existsSync(huPath)) {
      console.error(`❌ File not found: ${huPath}`);
      process.exit(1);
    }
    await addToLocaleFile(huPath, parsedKey, huText);
    console.log(`✅ Added to ${huPath}`);

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
  } catch (error) {
    console.error(
      '\n❌ Error:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

main();
