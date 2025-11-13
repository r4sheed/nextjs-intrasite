# Next.js 16 Migration TODO

## Overview

**Status:** ✅ **MIGRATION COMPLETE** - Next.js 16 is now fully functional  
**Current Version:** Next.js 16.0.3 ✅  
**Target Version:** Next.js 16 (latest) ✅

Next.js 16 introduces significant architectural changes including middleware → proxy migration, Turbopack as default bundler, React Compiler support, and new caching model with Cache Components.

Next.js 16 introduces significant architectural changes including middleware → proxy migration, Turbopack as default bundler, React Compiler support, and new caching model with Cache Components.

## Upgrade Command

```bash
# Automated upgrade with codemod
npx @next/codemod@canary upgrade latest

# Or manual upgrade
npm install next@latest react@latest react-dom@latest
```

## Pre-Migration Checklist

- [ ] Review all breaking changes below
- [ ] Ensure Node.js 20.9+ is installed (currently required)
- [ ] Backup current codebase or create migration branch
- [ ] Run automated codemod first, then manual fixes
- [ ] Test thoroughly in development before production

## Critical Breaking Changes

## Critical Breaking Changes

### 1. 🛡️ Middleware → Proxy Migration

**Impact:** **CRITICAL** - Breaks application if not migrated  
**Status:** Not Started  
**Priority:** HIGH

**What Changed:**

- `middleware.ts` filename is **deprecated** (still works but will be removed)
- New recommended file: `proxy.ts`
- Runs on **Node.js runtime** (not Edge runtime)
- Makes network boundary explicit

**Migration Steps:**

1. **Rename file:**

   ```bash
   # Rename middleware.ts to proxy.ts
   mv src/middleware.ts src/proxy.ts
   ```

2. **Update export name:**

   ```typescript
   // OLD (middleware.ts):
   export default auth(req => { ... })

   // NEW (proxy.ts):
   export default function proxy(req) { ... }

   // Or with Auth.js wrapper:
   export default auth(function proxy(req) { ... })
   ```

3. **Keep logic the same:**
   - Route protection logic remains identical
   - `NextRequest` and `NextResponse` still work
   - `config.matcher` stays the same

**Affected Files:**

- `src/middleware.ts` → **rename to** `src/proxy.ts`
- Auth logic (already using `auth()` wrapper - compatible)

**Timeline:** Do this **FIRST** before upgrading to Next.js 16

---

### 2. ⚙️ Version Requirements

**Impact:** HIGH  
**Status:** Not Started

**Required Updates:**

| Dependency | Current | Required    | Action                                      |
| ---------- | ------- | ----------- | ------------------------------------------- |
| Node.js    | ?       | **20.9.0+** | Verify/upgrade Node.js                      |
| TypeScript | 5.x     | **5.1.0+**  | Already compatible ✅                       |
| Next.js    | 15.5.6  | **16.x**    | `npm install next@latest`                   |
| React      | 19.1.0  | **19.2+**   | `npm install react@latest react-dom@latest` |

**Steps:**

1. Check Node.js version: `node --version`
2. Upgrade if needed: download from [nodejs.org](https://nodejs.org/)
3. Update dependencies (see upgrade command above)

---

### 3. 📦 Default Bundler Change: Turbopack

**Impact:** MEDIUM  
**Status:** Already using Turbopack ✅

**Current Status:**

- ✅ Already using `--turbopack` flag in `package.json`
- ✅ Next.js 16 makes Turbopack default
- No action needed unless issues arise

**Fallback to Webpack (if needed):**

```json
// package.json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack"
  }
}
```

---

### 4. 🚫 Removed Features

**Impact:** LOW (none used in project)  
**Status:** Not applicable

**Removed in Next.js 16:**

- ❌ AMP support (not using)
- ❌ `next lint` command (already using `eslint` directly ✅)
- ❌ `serverRuntimeConfig`, `publicRuntimeConfig` (not using)
- ❌ `experimental.ppr` flag (not using)
- ❌ `experimental.dynamicIO` (not using)

**No action needed** - none of these are used in the project.

---

### 5. 🔄 Async Params Breaking Change

**Impact:** MEDIUM (needs verification)  
**Status:** Needs investigation

**What Changed:**

- `params` and `searchParams` in pages/layouts are now **async**
- Must use `await params` and `await searchParams`

**Check Required:**

```bash
# Search for params/searchParams usage
grep -r "params\|searchParams" src/app/**/*.tsx
```

**Current Status:** ✅ Initial scan shows no direct `params`/`searchParams` usage in pages

- Pages are mostly static or client components
- Need to verify if any dynamic routes exist

**Action:** Verify all page.tsx and layout.tsx files don't use sync params

---

### 6. 🖼️ Image Configuration Changes

**Impact:** LOW  
**Status:** Review recommended

**Breaking Changes:**

| Setting                          | Old Default  | New Default                    | Impact          |
| -------------------------------- | ------------ | ------------------------------ | --------------- |
| `images.minimumCacheTTL`         | 60s          | **4 hours (14400s)**           | Better caching  |
| `images.imageSizes`              | includes 16  | **16 removed**                 | Smaller srcset  |
| `images.qualities`               | [1..100]     | **[75]**                       | Simpler quality |
| `images.localPatterns`           | not required | **required for query strings** | Security        |
| `images.dangerouslyAllowLocalIP` | allowed      | **blocked by default**         | Security        |
| `images.maximumRedirects`        | unlimited    | **3 max**                      | Security        |

**Action:** Review if using `next/image` with:

- Local images with query strings → add `images.localPatterns`
- Local IP addresses → set `dangerouslyAllowLocalIP: true`
- Otherwise defaults are fine ✅

---

### 7. 🔧 Caching API Changes

**Impact:** MEDIUM (if using revalidation)  
**Status:** Needs review

**Breaking Change:**

```typescript
// ❌ OLD (deprecated in Next.js 16):
revalidateTag('blog-posts');

// ✅ NEW (requires cacheLife profile):
revalidateTag('blog-posts', 'max'); // Stale-while-revalidate

// Or for immediate read-your-writes in Server Actions:
updateTag('blog-posts'); // New API
```

**New APIs:**

- `revalidateTag(tag, profile)` - stale-while-revalidate behavior
- `updateTag(tag)` - Server Actions only, immediate refresh
- `refresh()` - Server Actions only, refresh uncached data

**Action:** Search for `revalidateTag` usage in codebase

---

### 8. 🎨 ESLint Flat Config Default

**Impact:** LOW (already using Flat Config ✅)  
**Status:** Compatible

**Current Status:**

- ✅ Already using ESLint Flat Config in `eslint.config.js`
- No action needed

---

## New Features to Adopt

## New Features to Adopt

### ⚡ React Compiler 1.0 (Stable)

**Impact:** MEDIUM  
**Status:** Not Started  
**Priority:** MEDIUM

**Description:**
React Compiler 1.0 is now **stable** in Next.js 16. Provides automatic memoization without manual `useMemo`/`useCallback`.

**Benefits:**

- Automatic component/hook memoization
- Up to **12% faster initial loads**
- **2.5x faster interactions** in some cases
- Reduced manual optimization burden

**Migration Steps:**

1. **Install React Compiler:**

   ```bash
   npm install babel-plugin-react-compiler@latest
   ```

2. **Enable in next.config.ts:**

   ```typescript
   const nextConfig = {
     reactCompiler: true, // No longer in experimental!
   };
   ```

3. **Update ESLint for compiler-powered linting:**

   ```bash
   npm install eslint-plugin-react-hooks@latest
   ```

   Already configured in `eslint.config.js` ✅

4. **Test and measure:**
   - Development builds will be slower (uses Babel)
   - Production should see performance gains
   - Monitor bundle size and runtime metrics

**Trade-offs:**

- ⚠️ Slower compile times (Babel overhead)
- ✅ Better runtime performance
- ✅ Less manual optimization needed

**Decision:** Enable incrementally, test performance impact

**Affected Files:**

- `next.config.ts` (add `reactCompiler: true`)
- All React components (automatic optimization)

---

### 🗂️ Cache Components (New Caching Model)

**Impact:** LOW (optional, new architecture)  
**Status:** Not Started  
**Priority:** LOW

**Description:**
New caching model using `"use cache"` directive for explicit, opt-in caching.

**Key Changes:**

- Replaces implicit caching in App Router
- All pages/routes are **dynamic by default** (better expectations)
- Opt-in to caching with `"use cache"` directive
- Completes Partial Pre-Rendering (PPR) story

**Enable in next.config.ts:**

```typescript
const nextConfig = {
  cacheComponents: true,
};
```

**When to Use:**

- New projects wanting explicit caching
- Replacing old `experimental.ppr` setup (not using ✅)
- Complex caching requirements

**Decision:** Skip for now, evaluate later (optional feature)

---

### 🛠️ Next.js DevTools MCP

**Impact:** LOW (development experience)  
**Status:** Optional

**Description:**
Model Context Protocol integration for AI-assisted debugging.

**Features:**

- Unified browser + server logs
- Automatic error access with stack traces
- Page-aware contextual debugging
- Next.js routing/caching knowledge for AI agents

**When to Use:** Optional developer productivity tool

---

### 📊 Improved Logging

**Impact:** LOW (automatic)  
**Status:** Automatic improvement

**Description:**
Better development and build logging showing time breakdown:

- **Compile:** Routing + compilation time
- **Render:** Code execution + React rendering time
- Build steps now show individual timing

**Action:** None - automatic improvement ✅

---

### 🚀 Enhanced Routing & Prefetching

**Impact:** LOW (automatic)  
**Status:** Automatic improvement

**Description:**
Automatic improvements to navigation:

- **Layout deduplication:** Shared layouts downloaded once instead of per-link
- **Incremental prefetching:** Only prefetch missing cache parts
- Automatic prefetch cancellation when links leave viewport
- Re-prefetch on data invalidation

**Trade-off:** More prefetch requests, but lower total transfer size

**Action:** None - automatic improvement ✅

---

### 🔧 Turbopack File System Caching (Beta)

**Impact:** MEDIUM  
**Status:** Optional (beta)

**Description:**
Faster compile times across restarts for large projects.

**Enable in next.config.ts:**

```typescript
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};
```

**Benefits:**

- Significantly faster restarts
- Better for large repositories
- Already used by Vercel internal apps

**Decision:** Test in development, enable if beneficial

---

## Migration Checklist

### Phase 1: Pre-Migration (Do First)

- [x] **Verify Node.js 20.9+** (`node --version`) ✅ v22.19.0
- [ ] **Create migration branch** (`git checkout -b migration/nextjs-16`)
- [x] **Backup package-lock.json** ✅ Done during troubleshooting
- [x] **Read upgrade guide:** https://nextjs.org/docs/app/guides/upgrading/version-16 ✅ Done

### Phase 2: File Migrations

- [x] **Rename middleware.ts → proxy.ts** ✅ Already renamed
- [x] **Update export to `proxy` function name** ✅ Already compatible
- [x] **Test middleware/proxy logic locally** ✅ Working

### Phase 3: Dependency Updates

- [x] **Run automated codemod:** `npx @next/codemod@canary upgrade latest` ✅ Done
- [x] **Manual upgrade:** `npm install next@latest react@latest react-dom@latest` ✅ Done
- [x] **Review lockfile changes** ✅ Done
- [x] **Install React Compiler (optional):** `npm install babel-plugin-react-compiler@latest` ✅ Done

### Phase 4: Configuration Updates

- [x] **Review next.config.ts** (see recommended config below) ✅ Done
- [x] **Check image configuration** (if using local images with query strings) ✅ No changes needed
- [x] **Update revalidateTag calls** (if any exist) ✅ None found
- [x] **Enable React Compiler** (optional, in next.config.ts) ✅ Done

### Phase 5: Code Verification

- [x] **Search for async params/searchParams usage** (likely none) ✅ None found
- [x] **Verify no parallel routes without default.js** (check if any exist) ✅ None found
- [x] **Test all auth flows:** ✅ Working
  - [x] Login/logout ✅ Working
  - [x] Protected routes redirect ✅ Working
  - [x] OAuth callbacks ✅ Working
  - [x] Email verification flow ✅ Working
- [x] **Run typecheck:** `npm run typecheck` ✅ Passing
- [x] **Run linter:** `npm run lint` ✅ Passing
- [x] **Run tests:** `npm run test` ✅ Passing

### Phase 6: Testing

- [x] **Test dev server:** `npm run dev` ✅ Working
- [x] **Test build:** `npm run build` ✅ Working
- [x] **Test production:** `npm run start` ✅ Working
- [x] **Test all pages/routes manually** ✅ Working
- [x] **Monitor console for warnings/errors** ✅ No issues
- [x] **Check performance metrics** (build time, bundle size) ✅ Good

### Phase 7: Deployment

- [ ] **Test in staging environment**
- [ ] **Monitor production metrics**
- [ ] **Prepare rollback plan**
- [ ] **Deploy to production**

---

## Recommended next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optional: Enable React Compiler (test first - slower builds)
  // reactCompiler: true,
  // Optional: Enable Turbopack filesystem caching (beta)
  // experimental: {
  //   turbopackFileSystemCacheForDev: true,
  // },
  // Optional: Enable Cache Components (new caching model)
  // cacheComponents: true,
  // Optional: Image config adjustments (if needed)
  // images: {
  //   localPatterns: [
  //     {
  //       pathname: '/assets/images/**',
  //       search: '',
  //     },
  //   ],
  // },
};

export default nextConfig;
```

---

## Post-Migration Monitoring

### Metrics to Track

- **Build time:** Compare before/after (expect slower with React Compiler)
- **Bundle size:** Should stay similar or improve
- **Runtime performance:** Should improve with React Compiler
- **First load time:** Monitor Core Web Vitals
- **Error rates:** Watch for new runtime errors

### Common Issues & Solutions

| Issue                  | Solution                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| Slower builds          | Disable `reactCompiler` or accept trade-off                         |
| Middleware not working | Verify renamed to `proxy.ts` and function name                      |
| Params errors          | Ensure all `params`/`searchParams` are awaited                      |
| Image errors           | Add `images.localPatterns` if using local images with query strings |
| Prefetch warnings      | Expected - more requests but lower total size                       |

---

---

## Resources

- **Official Upgrade Guide:** https://nextjs.org/docs/app/guides/upgrading/version-16
- **Next.js 16 Announcement:** https://nextjs.org/blog/next-16
- **React Compiler Docs:** https://react.dev/learn/react-compiler
- **Codemod Tool:** `npx @next/codemod@canary upgrade latest`
- **Next.js Conf 2025:** https://nextjs.org/conf (October 22, 2025)

---

## Project-Specific Notes

### What We're Currently Using

✅ **Compatible:**

- Turbopack (already using via `--turbopack` flag)
- ESLint Flat Config
- TypeScript 5.x
- No AMP, no deprecated APIs
- Simple auth middleware (easy to migrate to proxy.ts)

⚠️ **Needs Review:**

- Check for any `params`/`searchParams` usage in pages (initial scan: none found)
- Verify no `revalidateTag()` usage (needs second param)
- Check for local images with query strings (needs `localPatterns`)

### Recommended Migration Order

1. **Week 1: Preparation**
   - Verify Node.js version
   - Create migration branch
   - Review all breaking changes
   - Plan testing strategy

2. **Week 2: File Migrations**
   - Rename `middleware.ts` → `proxy.ts`
   - Test proxy logic thoroughly
   - Update any related documentation

3. **Week 3: Dependency Upgrade**
   - Run automated codemod
   - Manual package updates
   - Fix any codemod issues
   - Run all tests

4. **Week 4: Testing & Optimization**
   - Enable React Compiler (optional)
   - Test all features
   - Monitor performance
   - Prepare for production

5. **Week 5: Deployment**
   - Deploy to staging
   - Monitor metrics
   - Deploy to production
   - Post-deployment monitoring

---

## Priority Summary

| Task                       | Priority   | Effort | Risk   |
| -------------------------- | ---------- | ------ | ------ |
| middleware.ts → proxy.ts   | **HIGH**   | Low    | Low    |
| Node.js 20.9+ verification | **HIGH**   | Low    | Low    |
| Dependency updates         | **HIGH**   | Low    | Medium |
| Verify async params usage  | **MEDIUM** | Low    | Low    |
| React Compiler adoption    | **MEDIUM** | Medium | Medium |
| Cache Components           | **LOW**    | High   | Low    |
| Turbopack FS caching       | **LOW**    | Low    | Low    |

**Overall Risk:** **LOW-MEDIUM** - Most changes are straightforward, biggest change is middleware rename.

**Estimated Total Effort:** 2-3 days of focused work + 1 week of testing

---

## Questions to Answer Before Migration

- [ ] What Node.js version are we running?
- [ ] Do we have a staging environment for testing?
- [ ] Are there any custom webpack configurations? (check for conflicts)
- [ ] Do we use `revalidateTag()` anywhere? (needs API update)
- [ ] Do we have any parallel routes? (need default.js files)
- [ ] What's our rollback strategy if issues arise?
- [ ] Should we enable React Compiler immediately or wait?

---

## Success Criteria

✅ Migration is successful when:

- ✅ All pages load without errors
- ✅ Auth flows work (login, logout, protected routes, OAuth)
- ✅ Build completes without errors
- ✅ Tests pass
- ✅ No console warnings in dev/prod
- ✅ Performance metrics stable or improved
- ✅ Lighthouse scores maintained or improved

**MIGRATION STATUS: ALL CRITERIA MET ✅**

---

**Last Updated:** Based on Next.js 16 stable release (October 21, 2025)  
**Next Review:** After migration completion
