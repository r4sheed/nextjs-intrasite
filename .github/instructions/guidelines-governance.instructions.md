---
description: 'Guidelines Governance - How to maintain, update, and enforce project guidelines'
applyTo: '**'
---

# Guidelines Governance & Enforcement

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** All contributors (AI and human developers)

---

## Overview

This document establishes **meta-guidelines** for maintaining, updating, and enforcing the project's instruction files. These rules ensure that guidelines remain consistent, non-redundant, and actionable.

---

## Core Principles

1. **Guidelines Must Be Enforced** - Every guideline violation must be caught before implementation
2. **Guidelines Must Evolve** - Outdated rules must be updated, not bypassed
3. **Single Source of Truth** - No redundant or conflicting guidelines across files
4. **Clear and Actionable** - Every rule must have clear DO/DON'T examples
5. **Version Controlled** - All changes must be tracked with version numbers and dates

---

## Enforcement Protocol

### When AI Receives a Request

**CRITICAL: Before implementing ANY request, AI must:**

1. **Check for Guideline Violations**
   - Search relevant instruction files for applicable rules
   - Identify any conflicts between the request and existing guidelines

2. **If Violation Detected - STOP and Propose Options**

   ```
   ⚠️ GUIDELINE CONFLICT DETECTED

   Request: [summarize user request]
   Violates: [guideline file name] - [specific rule]

   OPTIONS:
   A) Proceed with current guidelines (reject request)
   B) Update guidelines to allow this pattern (requires justification)
   C) Find alternative approach that complies with guidelines

   Which option would you prefer?
   ```

3. **Never Silently Bypass Guidelines**
   - ❌ DO NOT implement violations "just this once"
   - ❌ DO NOT assume guidelines are wrong without confirmation
   - ✅ DO flag the conflict and wait for user decision

### When Human Requests Guideline Changes

**AI must validate the change:**

1. **Check for Redundancy**
   - Does this rule already exist elsewhere?
   - Would this conflict with other guidelines?

2. **Request Justification**
   - Why is this change needed?
   - What problem does it solve?
   - Are there examples where current guidelines fail?

3. **Propose Consolidation**
   - If similar rules exist, suggest merging/updating instead of adding

---

## Guideline Update Process

### Required Changes for Every Update

1. **Version Number** - Increment version (e.g., 2.0 → 2.1)
2. **Last Updated Date** - Set to current date
3. **Changelog Entry** - Document what changed and why
4. **Cross-Reference Check** - Update all files that reference this guideline

### Version Numbering System

- **Major (X.0)** - Breaking changes, complete restructures
- **Minor (X.Y)** - New rules, significant clarifications
- **Patch (X.Y.Z)** - Typo fixes, small clarifications (optional)

### Update Template

```md
---
description: 'Brief description'
applyTo: '**'
version: '2.1'
lastUpdated: 'November 2025'
changelog:
  - version: '2.1'
    date: '2025-11-02'
    changes: 'Added X rule, clarified Y pattern'
  - version: '2.0'
    date: '2025-10-15'
    changes: 'Initial structured version'
---
```

---

## Guideline Structure Requirements

### Every Guideline File Must Have

1. **Frontmatter**

   ```yaml
   ---
   description: 'Clear one-line summary'
   applyTo: '**' # or specific pattern like 'src/features/**'
   priority: 'critical' | 'important' | 'recommended'
   ---
   ```

2. **Version Header**

   ```md
   **Version:** X.Y  
   **Last Updated:** Month Year  
   **Target:** Technologies this applies to
   ```

3. **Overview Section** - What problem does this solve?

4. **Core Principles** - Numbered list of key rules

5. **Examples with DO/DON'T**

   ```md
   ### ✅ CORRECT: Description

   `code example`

   ### ❌ WRONG: Description

   `code example`

   **Why wrong:** Explanation
   ```

6. **Rules Summary** - Bulleted MUST/NEVER lists at the end

---

## Redundancy Prevention

### Before Adding a New Guideline

**Check these files for overlap:**

1. `error-handling-guidelines.instructions.md` - Error patterns, Response types
2. `messages-and-codes.instructions.md` - Naming, i18n, constants
3. `naming-conventions.instructions.md` - File/function naming
4. `nextjs.instructions.md` - Next.js patterns, component structure
5. `typescript-5-es2022.instructions.md` - TypeScript rules

### Consolidation Rules

- **If rule applies to single domain** → Put in domain-specific file
- **If rule applies to entire project** → Put in most relevant general file
- **If rule overlaps 2+ files** → Create cross-references, don't duplicate

Example:

```md
> For detailed naming conventions, see [naming-conventions.instructions.md](naming-conventions.instructions.md).
```

---

## Guideline Consistency Checks

### AI Must Verify After Every Guideline Change

1. **No Conflicts** - New rule doesn't contradict existing rules
2. **No Redundancy** - Content isn't duplicated elsewhere
3. **Cross-References Updated** - All mentions in other files updated
4. **Examples Provided** - At least one DO and DON'T example
5. **Actionable** - Rule is clear enough to follow without interpretation

### Monthly Review Checklist (Human + AI)

- [ ] All version numbers and dates are current
- [ ] No outdated technology references (check target versions)
- [ ] All cross-references still valid
- [ ] All examples still follow current patterns
- [ ] No contradictions between files

---

## Scope of Each Guideline File

### error-handling-guidelines.instructions.md

**Covers:** Response types, AppError, layer responsibilities, error flow, HTTP status codes  
**Does NOT cover:** Naming conventions (see messages-and-codes), TypeScript config

### messages-and-codes.instructions.md

**Covers:** Error codes, i18n keys, constant naming (camelCase/kebab-case)  
**Does NOT cover:** Error handling flow, Response pattern

### naming-conventions.instructions.md

**Covers:** Auth feature file/function naming patterns  
**Does NOT cover:** General TypeScript naming (see typescript-5-es2022)

### nextjs.instructions.md

**Covers:** Next.js App Router, component patterns, project structure  
**Does NOT cover:** TypeScript rules, error handling specifics

### typescript-5-es2022.instructions.md

**Covers:** TypeScript language features, ES2022 syntax, general best practices  
**Does NOT cover:** Next.js specifics, error handling patterns

### guidelines-governance.instructions.md (this file)

**Covers:** How to maintain all other guidelines  
**Does NOT cover:** Technical implementation details

---

## AI Behavior Requirements

### When Reading Guidelines

- ✅ **DO** read all relevant guideline files before implementing
- ✅ **DO** flag conflicts immediately
- ✅ **DO** suggest guideline updates when patterns don't fit
- ❌ **DON'T** assume guidelines are outdated without asking
- ❌ **DON'T** implement "quick fixes" that violate guidelines

### When Writing Code

- ✅ **DO** cite specific guideline sections in code comments when following complex patterns
- ✅ **DO** suggest guideline updates when discovering missing scenarios
- ❌ **DON'T** write code that requires guideline violations
- ❌ **DON'T** add TODO comments about "fixing this later" for guideline violations

### When Updating Guidelines

- ✅ **DO** update version number and date
- ✅ **DO** check for cross-references in other files
- ✅ **DO** maintain consistent formatting
- ❌ **DON'T** delete old examples without replacing them
- ❌ **DON'T** change rules without documenting the reason

---

## Example Scenarios

### Scenario 1: User Requests Violating Pattern

**User:** "Add a new feature that throws errors from server actions"

**AI Response:**

```
⚠️ GUIDELINE CONFLICT DETECTED

Request: Throw errors from server actions
Violates: error-handling-guidelines.instructions.md - Section 6
Rule: "Server actions must always return Response<T>, never throw"

OPTIONS:
A) Follow current guidelines: Use response.error() instead of throw
B) Update guidelines to allow throws (NOT RECOMMENDED - breaks type safety)
C) Explain why this pattern is needed and find alternative

Current guideline exists for type safety and consistent error handling.
Which approach would you prefer?
```

### Scenario 2: Guideline Gap Discovered

**AI:** "I notice the guidelines cover auth feature structure, but there's no template for creating new features. Should I:

A) Create a new guideline file: `feature-scaffolding.instructions.md`
B) Add a section to `nextjs.instructions.md`
C) Create a script + brief docs in project README

Option C seems most practical - create reusable tooling rather than manual documentation. Shall I proceed?"

### Scenario 3: Redundant Guideline Found

**AI:** "I found duplicate naming rules:

- `naming-conventions.instructions.md` - camelCase for objects
- `typescript-5-es2022.instructions.md` - camelCase for object properties

Suggestion: Keep general rule in typescript file, keep auth-specific examples in naming-conventions, add cross-reference. Proceed?"

---

## Success Criteria

Guidelines are working when:

1. ✅ Zero code violates documented patterns
2. ✅ AI catches conflicts before implementation
3. ✅ Guidelines updated whenever patterns change
4. ✅ No redundant rules across files
5. ✅ All rules have clear examples
6. ✅ Version history tracks all changes

---

## Maintenance Schedule

- **Before every PR** - AI checks for guideline violations
- **After every feature** - Update examples if new patterns emerge
- **Monthly** - Full guideline consistency review
- **Quarterly** - Check for outdated technology versions

---

## Summary

**For AI Assistants:**

1. Read guidelines before coding
2. Flag violations immediately
3. Propose guideline updates when needed
4. Never silently bypass rules
5. Keep guidelines synchronized

**For Human Developers:**

1. Trust the AI to enforce guidelines
2. Update guidelines when patterns change
3. Review guideline conflicts together with AI
4. Keep guidelines as single source of truth
5. Document exceptions explicitly

**Remember:** Guidelines exist to maintain consistency, not to block progress. When guidelines don't fit, update them - don't bypass them.
