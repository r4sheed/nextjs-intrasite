# i18n Management Scripts Guide

## Purpose

Automate translation and TypeScript constant management across the application. Use these scripts to maintain consistency between JSON translation files and TypeScript constants.

---

## Quick Reference

```bash
# Add new translation key
npm run i18n:add <key> <en-text> <hu-text>
npm run i18n:add                              # Interactive mode

# Validate translations
npm run i18n:validate

# Sync translations and constants
npm run i18n:sync --dry-run                   # Preview changes
npm run i18n:sync                             # Apply changes
```

---

## When to Use

### Use `i18n:add` when:

- Adding a new error message
- Creating a new success message
- Adding UI labels or text
- Adding any user-facing translatable string

**Example:**

```bash
npm run i18n:add auth.errors.password-mismatch "Passwords do not match" "A jelszavak nem egyeznek"
```

### Use `i18n:validate` when:

- Before committing changes
- After manually editing JSON files
- To check for missing Hungarian translations
- To verify TypeScript constants sync

**Example output:**

```
✅ All i18n files are valid!
   auth: 72 keys, 0 missing, 0 extra
   common: 8 keys, 0 missing, 0 extra
```

### Use `i18n:sync` when:

- After multiple manual JSON edits
- To auto-add `[HU]` placeholders for missing translations
- To update TypeScript constants from JSON
- To remove orphaned translations

**Example:**

```bash
npm run i18n:sync --dry-run   # See what will change
npm run i18n:sync             # Apply changes
```

---

## Common Workflows

### Workflow 1: Adding a New Error

```bash
# 1. Add translation
npm run i18n:add auth.errors.rate-limit "Too many requests" "Túl sok kérés"

# 2. Use in code
import { AUTH_ERRORS } from '@/features/auth/lib/strings';

return response.error(
  new AppError({
    code: 'rate-limit',
    message: { key: AUTH_ERRORS.rateLimit },
    httpStatus: HTTP_STATUS.TOO_MANY_REQUESTS,
  })
);

# 3. Validate before commit
npm run i18n:validate
```

### Workflow 2: Creating a New Feature

```bash
# 1. Create feature scaffold
npm run feature:create bookmarks

# 2. Add translations
npm run i18n:add bookmarks.success.created "Bookmark created" "Könyvjelző létrehozva"
npm run i18n:add bookmarks.errors.not-found "Bookmark not found" "Könyvjelző nem található"

# 3. Validate
npm run i18n:validate
```

### Workflow 3: Manual JSON Edits

If you manually edit locale JSON files:

```bash
# 1. Make your edits in src/locales/en/{domain}.json

# 2. Preview what sync will do
npm run i18n:sync --dry-run

# 3. Apply changes
npm run i18n:sync

# 4. Validate
npm run i18n:validate
```

---

## Key Format Rules

### Structure

```
domain.category.key-name
```

**Examples:**

- `auth.errors.invalid-email`
- `bookmarks.success.created`
- `common.loading`
- `errors.not-found`

### Domain Types

| Domain      | Structure | Constant File                           | Example                    |
| ----------- | --------- | --------------------------------------- | -------------------------- |
| `errors`    | Flat      | `src/lib/errors/messages.ts`            | `errors.not-found`         |
| `auth`      | Nested    | `src/features/auth/lib/strings.ts`      | `auth.errors.invalid-emai` |
| `common`    | Flat      | None (no constants)                     | `common.loading`           |
| `{feature}` | Nested    | `src/features/{feature}/lib/strings.ts` | `bookmarks.success.created |

### Category → Constant Mapping

| Category   | TypeScript Constant |
| ---------- | ------------------- |
| `errors`   | `{DOMAIN}_ERRORS`   |
| `success`  | `{DOMAIN}_SUCCESS`  |
| `labels`   | `{DOMAIN}_LABELS`   |
| `warnings` | `{DOMAIN}_WARNINGS` |

**Special case:**

- `errors` domain → `CORE_ERRORS` constant

---

## File Locations

```
src/
  locales/
    en/
      auth.json        # English translations for auth
      common.json      # English common strings
      errors.json      # English core errors
    hu/
      auth.json        # Hungarian translations for auth
      common.json      # Hungarian common strings
      errors.json      # Hungarian core errors
  features/
    auth/
      lib/
        strings.ts     # AUTH_CODES, AUTH_ERRORS, AUTH_SUCCESS, AUTH_LABELS
  lib/
    errors/
      messages.ts      # CORE_ERRORS
```

---

## TypeScript Constant Format

### Generated Constants

```typescript
// src/features/auth/lib/strings.ts

export const AUTH_ERRORS = {
  invalidEmail: 'auth.errors.invalid-email', // camelCase property
  passwordRequired: 'auth.errors.password-required',
  passwordTooShort: 'auth.errors.password-too-short',
} as const;
```

### Naming Convention

- **JSON key:** `kebab-case` (e.g., `password-too-short`)
- **TypeScript property:** `camelCase` (e.g., `passwordTooShort`)
- **Constant name:** `{DOMAIN}_{CATEGORY}` (e.g., `AUTH_ERRORS`)

---

## Interactive Mode

All scripts support interactive mode (prompts for input):

```bash
npm run i18n:add        # Prompts for key, EN text, HU text
npm run i18n:validate   # No prompts (auto-runs)
npm run i18n:sync       # Prompts to apply changes after dry-run
```

---

## Error Messages

### "Key already exists"

The translation key is already in the JSON file. Use `i18n:sync` to update constants instead.

### "File not found"

The domain doesn't exist yet. Create it first:

```bash
npm run feature:create <domain>  # For feature domains
```

Or manually create the locale JSON files for non-feature domains.

### "Invalid key format"

Key must be in format: `domain.category.key-name`

**Valid:**

- `auth.errors.invalid-email`
- `bookmarks.success.created`

**Invalid:**

- `invalid-email` (missing domain and category)
- `auth.invalid-email` (missing category for nested domains)

---

## Best Practices

1. **Use scripts, not manual edits** - Always prefer scripts over editing 3 files manually
2. **Validate before committing** - Run `npm run i18n:validate` before git commits
3. **Meaningful keys** - Use descriptive names like `password-too-short`, not `error1`
4. **Consistent categories** - Stick to `errors`, `success`, `labels`, `warnings`
5. **Parameters in translations** - Use `{param}` for dynamic values:
   ```json
   "not-found": "{resource} could not be found"
   ```

---

## Integration with Code

### Using in Server Actions

```typescript
import { AUTH_ERRORS } from '@/features/auth/lib/strings';

export const loginUser = async (values: LoginInput) => {
  if (!user) {
    return response.error(
      new AppError({
        code: 'invalid-credentials',
        message: { key: AUTH_ERRORS.invalidCredentials },
        httpStatus: HTTP_STATUS.UNAUTHORIZED,
      })
    );
  }
};
```

### Using in Components

```typescript
import { AUTH_LABELS } from '@/features/auth/lib/strings';
import { useTranslations } from 'next-intl';

export function LoginForm() {
  const t = useTranslations();

  return (
    <form>
      <h1>{t(AUTH_LABELS.loginTitle)}</h1>
      <label>{t(AUTH_LABELS.emailLabel)}</label>
      <input placeholder={t(AUTH_LABELS.emailPlaceholder)} />
      <button>{t(AUTH_LABELS.loginButton)}</button>
    </form>
  );
}
```

---

## Troubleshooting

### Script generates invalid TypeScript

**Issue:** Constant names have hyphens or invalid characters

**Solution:** This shouldn't happen with current scripts. If it does:

1. Check your key format (must be `domain.category.key-name`)
2. Run `npm run i18n:sync --dry-run` to preview
3. Report the issue if the script generates invalid code

### Missing Hungarian translation

**Issue:** Added English translation but Hungarian is missing

**Solution:**

```bash
# Option 1: Add manually
npm run i18n:add auth.errors.new-error "English text" "Magyar szöveg"

# Option 2: Use sync to add placeholder
npm run i18n:sync  # Adds "[HU] English text" as placeholder
```

### Orphaned constants

**Issue:** TypeScript constant references deleted JSON key

**Solution:**

```bash
npm run i18n:sync  # Removes orphaned constants
```

---

## Testing

Scripts have comprehensive test coverage:

```bash
npm test src/__tests__/i18n-scripts.test.ts
```

Tests cover:

- Key parsing (flat vs nested domains)
- JSON file operations
- TypeScript constant generation
- Missing/extra translation detection
- Alphabetical sorting

---

## Related Documentation

- **Error Handling:** `.github/instructions/error-handling-guidelines.instructions.md`
- **Messages & Codes:** `.github/instructions/messages-and-codes.instructions.md`
- **Feature Creation:** `.github/prompts/feature-creation.prompt.md`

---

## Summary

| Task                   | Command                                                 |
| ---------------------- | ------------------------------------------------------- |
| Add translation        | `npm run i18n:add <key> <en> <hu>`                      |
| Validate translations  | `npm run i18n:validate`                                 |
| Sync after manual edit | `npm run i18n:sync`                                     |
| Preview sync changes   | `npm run i18n:sync --dry-run`                           |
| Create new feature     | `npm run feature:create <name>` (auto-creates i18n)     |
| Before commit          | `npm run i18n:validate`                                 |
| Use in code            | `import { AUTH_ERRORS } from '@/features/auth/lib/stri` |
