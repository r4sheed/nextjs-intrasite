# i18n Management Scripts

This directory contains automated scripts for managing internationalization (i18n) across the application.

## Overview

These scripts help maintain consistency between translation files and TypeScript constants, reducing manual work and preventing errors when adding or updating translations.

## Scripts

### 1. `i18n:add` - Add New Translation Key

Adds a new translation key to all required files in one command.

**Updates:**

- `src/locales/en/{domain}.json` - English translation
- `src/locales/hu/{domain}.json` - Hungarian translation
- `src/features/{domain}/lib/strings.ts` - TypeScript constants (if exists)

**Usage:**

```bash
# CLI mode
npm run i18n:add <key> <en-text> <hu-text>

# Example
npm run i18n:add auth.errors.new-error "Invalid input" "Érvénytelen bemenet"

# Interactive mode (prompts for input)
npm run i18n:add
```

**What it does:**

- Parses the key into domain, category, and key name
- Adds the translation to both EN and HU locale files
- Automatically sorts keys alphabetically in JSON files
- Updates the corresponding TypeScript constant file
- Converts kebab-case keys to camelCase property names

**Example:**

```bash
npm run i18n:add auth.errors.password-mismatch "Passwords do not match" "A jelszavak nem egyeznek"
```

This will:

- Add to `src/locales/en/auth.json`:
  ```json
  {
    "auth": {
      "errors": {
        "password-mismatch": "Passwords do not match"
      }
    }
  }
  ```
- Add to `src/locales/hu/auth.json`:
  ```json
  {
    "auth": {
      "errors": {
        "password-mismatch": "A jelszavak nem egyeznek"
      }
    }
  }
  ```
- Update `src/features/auth/lib/strings.ts`:
  ```typescript
  export const AUTH_ERRORS = {
    passwordMismatch: 'auth.errors.password-mismatch',
    // ... other errors
  } as const;
  ```

---

### 2. `i18n:validate` - Validate Translation Files

Checks for inconsistencies between translation files.

**Validates:**

- Missing translations (keys in EN but not in HU)
- Extra translations (keys in HU but not in EN)
- TypeScript constant sync (constants vs JSON files)

**Usage:**

```bash
npm run i18n:validate
```

**Output example:**

```
🔍 Validating i18n files...

📦 Checking auth...
   auth: 15 keys, 0 missing, 0 extra
📦 Checking common...
   common: 8 keys, 0 missing, 0 extra

============================================================

✅ All i18n files are valid!
```

**Or with errors:**

```
============================================================

❌ 2 Error(s):

   Missing Hungarian translation for: auth.errors.password-mismatch
      File: src/locales/hu/auth.json
      Key: auth.errors.password-mismatch

   Constant references non-existent key: auth.errors.old-error
      File: src/features/auth/lib/strings.ts
      Key: auth.errors.old-error

❌ Validation failed!
```

---

### 3. `i18n:sync` - Synchronize Translation Files

Automatically synchronizes translation files and TypeScript constants.

**What it does:**

- Adds missing Hungarian translations with `[HU]` placeholders
- Removes extra Hungarian translations not in English
- Updates TypeScript constants to match JSON files
- Sorts all keys alphabetically

**Usage:**

```bash
# Preview changes without applying
npm run i18n:sync --dry-run

# Apply changes
npm run i18n:sync
```

**Output example:**

```
🔄 Syncing i18n files...

📦 Syncing auth...
   auth: 2 changes
📦 Syncing common...
   common: 0 changes

============================================================

✅ 2 Action(s):

   src/locales/hu/auth.json
      + Add: auth.errors.password-mismatch = [HU] Passwords do not match
      - Remove: auth.success.old-success

   src/features/auth/lib/strings.ts
      ~ Update: AUTH_ERRORS

✅ Sync complete!
```

---

## File Structure

The scripts work with the following file structure:

```
src/
  locales/
    en/
      auth.json        # English translations for auth
      common.json      # English common strings
      errors.json      # English error messages
    hu/
      auth.json        # Hungarian translations for auth
      common.json      # Hungarian common strings
      errors.json      # Hungarian error messages
  features/
    auth/
      lib/
        strings.ts     # TypeScript constants for auth
  lib/
    errors/
      messages.ts      # TypeScript constants for core errors
```

---

## Domain → File Mapping

The scripts automatically map domains to their corresponding files:

| Domain      | Locale Files                        | Constants File                          |
| ----------- | ----------------------------------- | --------------------------------------- |
| `auth`      | `src/locales/{lang}/auth.json`      | `src/features/auth/lib/strings.ts`      |
| `common`    | `src/locales/{lang}/common.json`    | N/A                                     |
| `errors`    | `src/locales/{lang}/errors.json`    | `src/lib/errors/messages.ts`            |
| `{feature}` | `src/locales/{lang}/{feature}.json` | `src/features/{feature}/lib/strings.ts` |

---

## Category → Constant Mapping

Keys are organized by category, which maps to TypeScript constant objects:

| Category   | Constant Object     | Example Key                                                        |
| ---------- | ------------------- | ------------------------------------------------------------------ |
| `errors`   | `{DOMAIN}_ERRORS`   | `auth.errors.invalid-email` → `AUTH_ERRORS.invalidEmail`           |
| `success`  | `{DOMAIN}_SUCCESS`  | `auth.success.login` → `AUTH_SUCCESS.login`                        |
| `labels`   | `{DOMAIN}_LABELS`   | `auth.labels.email` → `AUTH_LABELS.email`                          |
| `warnings` | `{DOMAIN}_WARNINGS` | `auth.warnings.session-expiring` → `AUTH_WARNINGS.sessionExpiring` |

---

## Key Naming Conventions

**i18n keys (JSON):**

- Use kebab-case: `password-too-short`, `email-required`
- Dots for nesting: `auth.errors.password-too-short`
- Max 2-3 nesting levels

**TypeScript properties:**

- Use camelCase: `passwordTooShort`, `emailRequired`
- Auto-converted from kebab-case keys

**Example:**

```typescript
// JSON key: "auth.errors.password-too-short"
// TypeScript: AUTH_ERRORS.passwordTooShort

export const AUTH_ERRORS = {
  passwordTooShort: 'auth.errors.password-too-short',
  emailRequired: 'auth.errors.email-required',
} as const;
```

---

## Workflow Examples

### Adding a New Error Message

```bash
# 1. Add the translation
npm run i18n:add auth.errors.rate-limit "Too many requests" "Túl sok kérés"

# 2. Use it in your code
import { AUTH_ERRORS } from '@/features/auth/lib/strings';

return response.error(
  new AppError({
    code: 'rate-limit',
    message: { key: AUTH_ERRORS.rateLimit },
    httpStatus: HTTP_STATUS.TOO_MANY_REQUESTS,
  })
);
```

### Adding a New Feature Domain

```bash
# 1. Create the feature (automatically creates locale files)
npm run feature:create bookmarks

# 2. Add translations
npm run i18n:add bookmarks.success.created "Bookmark created" "Könyvjelző létrehozva"
npm run i18n:add bookmarks.errors.not-found "Bookmark not found" "Könyvjelző nem található"

# 3. Validate
npm run i18n:validate
```

### Syncing After Manual Edits

If you manually edit JSON files or add keys outside of the scripts:

```bash
# 1. Preview what will change
npm run i18n:sync --dry-run

# 2. Apply changes
npm run i18n:sync

# 3. Validate everything is correct
npm run i18n:validate
```

---

## Best Practices

1. **Always use the scripts** - Don't manually edit 3 files for one translation
2. **Validate before committing** - Run `npm run i18n:validate` before git commits
3. **Use meaningful keys** - `password-too-short` not `error1`
4. **Keep categories consistent** - Use `errors`, `success`, `labels`, `warnings`
5. **Add context in translations** - Use parameters like `{email}`, `{min}` for dynamic values

---

## Troubleshooting

**Error: "Key already exists"**

- The key is already in the JSON file
- Check if you meant to update instead of add

**Error: "File not found"**

- Domain doesn't exist yet
- Run `npm run feature:create <domain>` first (for feature domains)

**Error: "Invalid key format"**

- Key must be in format: `domain.category.key`
- Example: `auth.errors.invalid-email`

**Warning: "Constants file not found"**

- Not all domains need constants files (e.g., `common`)
- This is expected for non-feature domains

---

## Testing

The scripts have comprehensive test coverage:

```bash
# Run all tests
npm test

# Run i18n tests specifically
npm test src/__tests__/i18n-scripts.test.ts
```

Tests cover:

- Key parsing and validation
- File reading/writing
- JSON sorting
- kebab-case to camelCase conversion
- Missing/extra translation detection
- Constants file synchronization

---

## Related Documentation

- [Error Handling Guidelines](../.github/instructions/error-handling-guidelines.instructions.md) - Complete error handling patterns
- [Messages and Codes](../.github/instructions/messages-and-codes.instructions.md) - Naming conventions for error codes and i18n keys
- [Feature Creation Guide](../.github/prompts/feature-creation.prompt.md) - How to create new features with i18n support
- [i18n Management Prompt](../.github/prompts/i18n-management.prompt.md) - Quick reference for i18n workflows
