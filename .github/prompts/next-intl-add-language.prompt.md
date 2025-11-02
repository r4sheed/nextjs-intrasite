# Adding a New Language to next-intl

## Overview

This guide shows how to add a new language to the next-intl configuration for multilingual support.

---

## Prerequisites

- next-intl installed and configured
- Existing locale files structure in `src/locales/`
- i18n management scripts available

---

## Steps

### 1. Create Locale Files

Create a new folder for the language in `src/locales/`:

```bash
mkdir src/locales/de  # Example for German
```

Copy existing locale structure:

```bash
# Copy from English as template
cp -r src/locales/en/* src/locales/de/
```

### 2. Translate JSON Files

Translate each JSON file in the new locale folder:

```
src/locales/de/
  ├── auth.json      # Authentication translations
  ├── common.json    # Common strings
  ├── errors.json    # Error messages
  └── ...
```

**Example (`de/auth.json`):**

```json
{
  "auth": {
    "errors": {
      "invalid-credentials": "Ungültige Anmeldedaten",
      "email-required": "E-Mail ist erforderlich"
    },
    "success": {
      "login": "Willkommen zurück!"
    },
    "labels": {
      "email": "E-Mail",
      "password": "Passwort"
    }
  }
}
```

### 3. Update next-intl Configuration

Update `src/i18n/config.ts` or equivalent:

```typescript
export const locales = ['en', 'hu', 'de'] as const; // Add new locale
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
```

### 4. Add Locale Messages Loader

Update your messages loader function:

```typescript
// src/i18n/messages.ts
import type { AbstractIntlMessages } from 'next-intl';

export async function getMessages(
  locale: string
): Promise<AbstractIntlMessages> {
  try {
    return (await import(`../locales/${locale}/index.ts`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    return (await import(`../locales/en/index.ts`)).default;
  }
}
```

### 5. Create Barrel Export (Optional)

Create `src/locales/de/index.ts`:

```typescript
import auth from './auth.json';
import common from './common.json';
import errors from './errors.json';

export default {
  ...auth,
  ...common,
  ...errors,
};
```

### 6. Update Middleware (if applicable)

If using next-intl middleware for locale detection:

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'hu', 'de'], // Add new locale
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
```

### 7. Add Language Switcher UI

Update your language switcher component:

```typescript
// components/language-switcher.tsx
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }, // Add new language
];
```

### 8. Validate Translations

Run validation to ensure completeness:

```bash
npm run i18n:validate
```

**Expected output:**

```
✅ All i18n files are valid!
   auth: 72 keys, 0 missing, 0 extra
   common: 8 keys, 0 missing, 0 extra
   errors: 6 keys, 0 missing, 0 extra
```

### 9. Test the New Language

1. Start the dev server: `npm run dev`
2. Switch to the new language in the UI
3. Verify all translations display correctly
4. Check for missing translations (should show keys)

---

## Using i18n Scripts with New Language

The i18n management scripts need to be updated to support the new language.

### Update i18n-add.ts

Modify the script to include the new locale:

```typescript
const locales = ['en', 'hu', 'de']; // Add new locale

// ... rest of the script
```

### Update i18n-validate.ts

Add the new locale to validation:

```typescript
const locales = ['en', 'hu', 'de']; // Add new locale
```

### Update i18n-sync.ts

Add the new locale to sync:

```typescript
const locales = ['en', 'hu', 'de']; // Add new locale
```

Then use the scripts normally:

```bash
# Add translation for all languages
npm run i18n:add auth.errors.new-error "English" "Magyar" "Deutsch"
```

---

## Checklist

After adding a new language:

- [ ] Created `src/locales/{locale}/` folder
- [ ] Copied and translated all JSON files
- [ ] Updated locale configuration in `src/i18n/config.ts`
- [ ] Updated messages loader function
- [ ] Updated middleware (if used)
- [ ] Added language to switcher UI
- [ ] Updated i18n scripts to support new locale
- [ ] Ran `npm run i18n:validate`
- [ ] Tested language switching in browser
- [ ] Verified all pages render correctly
- [ ] Committed all translation files

---

## Related Documentation

- **i18n Management:** `i18n-management.prompt.md`
- **Feature Creation:** `feature-creation.prompt.md`
- **Messages & Codes:** `../instructions/messages-and-codes.instructions.md`

---

## Example: Adding Spanish

Complete example for adding Spanish (es):

```bash
# 1. Create locale folder
mkdir src/locales/es

# 2. Copy English files as template
cp src/locales/en/*.json src/locales/es/

# 3. Update config
# Edit src/i18n/config.ts - add 'es' to locales array

# 4. Update i18n scripts
# Edit scripts/i18n-add.ts - add 'es' to locales array
# Edit scripts/i18n-validate.ts - add 'es' to locales array
# Edit scripts/i18n-sync.ts - add 'es' to locales array

# 5. Translate files manually or use translation service
# Edit each JSON file in src/locales/es/

# 6. Validate
npm run i18n:validate

# 7. Test
npm run dev
```

---

## Tips

- **Start with one domain** - Translate `common.json` first, then expand
- **Use placeholders** - Mark untranslated strings with `[ES]` prefix
- **Professional translation** - Consider professional translation services for production
- **RTL languages** - Additional configuration needed for right-to-left languages
- **Date/number formatting** - Configure formatters for locale-specific formats
- **Pluralization** - Use next-intl's plural support for count-based translations

---

## Troubleshooting

### Missing translations show as keys

This is expected behavior. Add the missing translations:

```bash
npm run i18n:add {domain}.{category}.{key} "EN" "HU" "DE"
```

### Locale not switching

Check:

1. Middleware configuration includes the new locale
2. Locale code matches folder name exactly
3. Messages loader handles the new locale
4. Browser cookies/localStorage cleared

### Build errors

Ensure:

1. All JSON files are valid JSON
2. Barrel exports are correct
3. TypeScript configuration allows JSON imports
