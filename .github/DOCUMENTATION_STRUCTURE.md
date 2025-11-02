# Documentation Structure

This document outlines the organization of all documentation and guideline files in the project.

---

## Directory Overview

```
.github/
├── instructions/          # Coding guidelines for AI and developers
├── prompts/              # Quick-start guides and prompts
└── DOCUMENTATION_STRUCTURE.md  # This file

docs/                     # Detailed reference documentation
```

---

## Instructions (`.github/instructions/`)

**Purpose:** Authoritative guidelines for code quality, patterns, and architecture.

**Audience:** AI assistants and developers maintaining/extending the codebase.

**Files:**

| File                                        | Description                                        |
| ------------------------------------------- | -------------------------------------------------- |
| `error-handling-guidelines.instructions.md` | Response pattern, AppError, layer responsibilities |
| `messages-and-codes.instructions.md`        | Error codes, i18n keys, naming conventions         |
| `naming-conventions.instructions.md`        | File/function naming patterns for auth feature     |
| `nextjs.instructions.md`                    | Next.js App Router best practices                  |
| `typescript-5-es2022.instructions.md`       | TypeScript 5 + ES2022 guidelines                   |
| `guidelines-governance.instructions.md`     | How to maintain and update guidelines              |

**When to use:**

- Implementing new features
- Refactoring existing code
- Reviewing PRs
- Updating project patterns

---

## Prompts (`.github/prompts/`)

**Purpose:** Quick-start guides and workflow documentation for common tasks.

**Audience:** Developers needing step-by-step instructions for specific tasks.

**Files:**

| File                               | Description                                  |
| ---------------------------------- | -------------------------------------------- |
| `feature-creation.prompt.md`       | How to create a new feature with scaffolding |
| `i18n-management.prompt.md`        | Quick reference for i18n scripts             |
| `next-intl-add-language.prompt.md` | How to add a new language to the application |

**When to use:**

- Creating a new feature
- Adding translations
- Setting up a new language
- Quick workflow reference

---

## Docs (`docs/`)

**Purpose:** Detailed reference documentation and technical guides.

**Audience:** Developers needing comprehensive information about specific systems.

**Files:**

| File                        | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `i18n-scripts-reference.md` | Complete reference for i18n management scripts |

**When to use:**

- Deep dive into i18n system
- Understanding script internals
- Troubleshooting i18n issues
- Learning advanced i18n workflows

---

## File Naming Conventions

### Instructions Files

- **Pattern:** `{topic}.instructions.md`
- **Case:** kebab-case
- **Suffix:** `.instructions.md`
- **Examples:**
  - `error-handling-guidelines.instructions.md`
  - `typescript-5-es2022.instructions.md`

### Prompt Files

- **Pattern:** `{topic}.prompt.md`
- **Case:** kebab-case
- **Suffix:** `.prompt.md`
- **Examples:**
  - `feature-creation.prompt.md`
  - `i18n-management.prompt.md`

### Reference Docs

- **Pattern:** `{topic}-{type}.md`
- **Case:** kebab-case
- **Suffix:** `.md`
- **Examples:**
  - `i18n-scripts-reference.md`
  - (future) `api-reference.md`

---

## Cross-References

### From README.md

```markdown
See [i18n Scripts Reference](docs/i18n-scripts-reference.md)
See [Feature Creation Guide](.github/prompts/feature-creation.prompt.md)
```

### From Instructions

```markdown
See [messages-and-codes.instructions.md](messages-and-codes.instructions.md)
```

### From Prompts

```markdown
See [Error Handling Guidelines](../instructions/error-handling-guidelines.instructions.md)
See [i18n Management Prompt](i18n-management.prompt.md)
```

### From Docs

```markdown
See [Feature Creation Guide](../.github/prompts/feature-creation.prompt.md)
See [Messages & Codes](../.github/instructions/messages-and-codes.instructions.md)
```

---

## Adding New Documentation

### When to Create an Instruction File

**Criteria:**

- Establishes coding standards
- Defines architectural patterns
- Sets quality requirements
- Applies across entire codebase

**Example:** Error handling pattern that all features must follow

**Location:** `.github/instructions/{topic}.instructions.md`

### When to Create a Prompt File

**Criteria:**

- Step-by-step workflow
- Quick-start guide
- Task-specific instructions
- Frequently performed operations

**Example:** How to add a new translation

**Location:** `.github/prompts/{topic}.prompt.md`

### When to Create a Reference Doc

**Criteria:**

- Comprehensive technical reference
- Detailed API documentation
- In-depth system explanation
- Troubleshooting guides

**Example:** Complete i18n scripts reference with all options

**Location:** `docs/{topic}-reference.md`

---

## Maintenance Guidelines

### Updating Documentation

1. **Check for redundancy** - Don't duplicate information across files
2. **Update cross-references** - Fix all links if renaming/moving files
3. **Version documentation** - Update "Last Updated" dates
4. **Test examples** - Ensure all code examples work
5. **Validate links** - Check all markdown links are valid

### Review Schedule

- **Monthly:** Check for outdated technology versions
- **Per feature:** Update when adding major features
- **Per guideline change:** Update all affected cross-references

### Cross-Reference Map

When updating a file, check these related files:

| File Updated                | Files to Check                                                                  |
| --------------------------- | ------------------------------------------------------------------------------- |
| `error-handling-guidelines` | `messages-and-codes`, `feature-creation.prompt`, all feature READMEs            |
| `messages-and-codes`        | `error-handling-guidelines`, `i18n-management.prompt`, `i18n-scripts-reference` |
| `feature-creation.prompt`   | `create-feature.ts` script, `README.md`, `i18n-management.prompt`               |
| `i18n-management.prompt`    | `i18n-scripts-reference`, i18n scripts (`i18n-*.ts`), `feature-creation.prompt` |
| `i18n-scripts-reference`    | `i18n-management.prompt`, `README.md`, i18n scripts                             |

---

## Documentation Hierarchy

```
Quickest → Most Detailed

README.md
   ↓
.github/prompts/{topic}.prompt.md
   ↓
docs/{topic}-reference.md
   ↓
.github/instructions/{topic}.instructions.md
```

**Example flow:**

1. User reads `README.md` → sees i18n scripts exist
2. Reads `i18n-management.prompt.md` → quick examples and common workflows
3. Reads `i18n-scripts-reference.md` → full details, all options, troubleshooting
4. Reads `messages-and-codes.instructions.md` → understands the architectural decisions

---

## Quick Navigation

### I want to...

| Task                            | Go to                                              |
| ------------------------------- | -------------------------------------------------- |
| Create a new feature            | `.github/prompts/feature-creation.prompt.md`       |
| Add a translation               | `.github/prompts/i18n-management.prompt.md`        |
| Understand error handling       | `.github/instructions/error-handling-guidelines`   |
| Learn naming conventions        | `.github/instructions/naming-conventions`          |
| Add a new language              | `.github/prompts/next-intl-add-language.prompt.md` |
| Troubleshoot i18n issues        | `docs/i18n-scripts-reference.md`                   |
| Understand project architecture | `.github/instructions/` (all files)                |
| Maintain/update guidelines      | `.github/instructions/guidelines-governance`       |

---

## Summary

- **Instructions** = Authoritative coding standards (`.instructions.md`)
- **Prompts** = Quick-start workflows (`.prompt.md`)
- **Docs** = Comprehensive reference (`-reference.md`)
- **All use kebab-case naming**
- **Cross-references use relative paths**
- **Update related files when making changes**
