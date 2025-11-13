---
description: 'Guidelines for implementing application routes using the centralized routes tree.'
applyTo: '**'
---

# Route Implementation Guidelines

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** Next.js + TypeScript project structure used by this repository.

Core principles:

- Single source of truth: define routes in `src/lib/routes.ts` only. Do not duplicate URLs in `navigation`, `middleware`, or components.
- Type-safe definitions: use the provided `RouteDefinition` shape and `RouteMeta` for optional metadata.
- Derived artifacts: navigation lists, middleware lookup Sets and other consumers must derive from `getAllRoutes()`.
- Immutable runtime values: route definitions, derived arrays and navigation items are frozen to prevent accidental mutation.

## What to edit when adding a new route

1. Open `src/lib/routes.ts`.
2. Add the route into the `routes` nested object. Follow existing naming conventions (camelCase keys, kebab-case URL values are already present in this repo's examples):

- Provide `url` (string)
- Provide `label` (i18n key string)
- Provide `access`: one of `'public' | 'auth' | 'protected'`
- Optionally provide `meta` with any of:
  - `showInNavigation?: boolean` — include in primary navigation
  - `navigationOrder?: number` — lower numbers shown earlier
  - `roles?: readonly string[]` — optional role-based constraint (future use)

Example:

```ts
// inside src/lib/routes.ts
someFeature: {
  url: '/some-feature',
  label: 'navigation.some-feature',
  access: 'protected',
  meta: { showInNavigation: true, navigationOrder: 10, roles: ['admin'] }
}
```

3. Save. Do NOT add the URL anywhere else.

## How derived artifacts are produced (do not duplicate)

- `getAllRoutes()` — returns all definitions as a flattened, immutable array. Use this in code that needs the full list of routes.
- `publicRoutes`, `authRoutes`, `protectedRoutes` — arrays of URL strings derived from `getAllRoutes()`.
- `publicRouteSet`, `authRouteSet`, `protectedRouteSet` — Sets used by `src/middleware.ts` for O(1) lookups.
- `navigationItems` — derived from routes with `meta.showInNavigation` and exported from `src/lib/navigation.ts`.

When consuming any of these values, import them from their owning module. Do not re-create or copy values.

## Navigation and UI

- To render primary navigation, import `navigationItems` from `src/lib/navigation` and use the `href` and `label` fields (labels are i18n keys).
- Navigation ordering is controlled by `meta.navigationOrder` on the route itself.
- Navigation items and route metadata are frozen (immutable). Do not attempt to mutate these objects.

## Middleware and auth flows

- Middleware (`src/middleware.ts`) should use the pre-computed Sets (`publicRouteSet`, `authRouteSet`, `protectedRouteSet`) for efficient route checks.
- For login redirect after successful auth, use `DEFAULT_LOGIN_REDIRECT` exported from `src/lib/routes`.

## Testing expectations

Add tests that assert derived data matches the authoritative source. Recommended checks:

- `getAllRoutes()` flattens the tree: compare manual traversal of `routes` with the `getAllRoutes()` output.
- Public/auth/protected arrays and Sets match the access values in definitions.
- `navigationItems` only contains routes with `meta.showInNavigation` and respects `navigationOrder`.
- Navigation items map back to the original route definition (href -> url, label equality).
- Route meta objects and any `roles` arrays are frozen (immutability).

Prefer deriving expected values from `getAllRoutes()` in tests instead of hardcoding URL strings — this reduces brittle failures when routes change.

## Role-based access (future)

The routes scheme supports `meta.roles` as an optional list of role strings. If you add `roles`, also:

- Consider adding a small helper in `src/lib/roles.ts` that maps application roles to route visibility.
- Add tests that verify routes with `meta.roles` are handled correctly by middleware and UI gating.

## Migration checklist when adding features

- Add route in `src/lib/routes.ts` — this is the only required edit for routing.
- If the route should be visible in nav, supply `meta.showInNavigation` and `meta.navigationOrder`.
- Add i18n strings for the `label` key in `src/locales/{lang}/{domain}.json`.
- If needed, add tests in `src/lib/__tests__/` that validate any new invariants introduced by the route.

## Governance

Follow the repository-wide instruction files for naming, messages and error handling. If you need to change the route structure or metadata semantics, open a PR with justification and update this guideline and tests accordingly.

---

Version history:

- 1.0 (2025-11-03) — Initial guideline added.
