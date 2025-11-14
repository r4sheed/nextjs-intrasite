import { NextResponse } from 'next/server';

import { middlewareConfig } from '@/lib/config';
import { routes } from '@/lib/navigation';
import {
  createStrictPrefixMatcher,
  matchesRoute,
  normalizePathname,
  validateCallbackUrl,
} from '@/lib/proxy';
import { authRouteSet, protectedRouteSet, publicRouteSet } from '@/lib/routes';

import { auth } from '@/features/auth/lib/auth';

// Create strict matcher for API auth routes to avoid false positives
const apiAuthMatcher = createStrictPrefixMatcher(
  middlewareConfig.authRoutePrefix
);

/**
 * Next.js middleware for authentication and route protection.
 *
 * This middleware checks if the user is authenticated and redirects accordingly:
 * - Allows API auth routes with strict prefix matching.
 * - Redirects logged-in users away from auth pages.
 * - Redirects unauthenticated users from protected routes to login with validated callback.
 * - Supports dynamic route patterns and normalizes pathnames for consistent matching.
 *
 * @param req - The incoming request object with auth property.
 * @returns NextResponse for redirects or NextResponse.next() to continue.
 */
export default auth(req => {
  const isLoggedIn = !!req.auth;

  const url = req.nextUrl ?? new URL(req.url);
  const rawPathname = url.pathname;

  // Normalize pathname (remove trailing slash, handle root case)
  const pathname = normalizePathname(rawPathname);

  // Use strict prefix matcher to prevent false positives (e.g., /api/authentication)
  const isApiAuthRoute = apiAuthMatcher.test(pathname);

  // Support both exact and dynamic route matching (e.g., /posts/[id])
  const isPublicRoute = matchesRoute(pathname, publicRouteSet);
  const isAuthRoute = matchesRoute(pathname, authRouteSet);
  const isExplicitProtectedRoute = matchesRoute(pathname, protectedRouteSet);

  const isProtectedRoute =
    isExplicitProtectedRoute || (!isPublicRoute && !isAuthRoute);

  // Allow internal API Auth Routes (e.g., NextAuth/Auth.js internal calls)
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect Logged-in Users from Auth Routes (e.g /login or /signup pages)
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(
      new URL(middlewareConfig.defaultLoginRedirect, url)
    );
  }

  // Redirect Unauthenticated Users from Protected Routes
  if (!isLoggedIn && isProtectedRoute) {
    const rawCallbackUrl = `${pathname}${url.search}`;

    // Validate callback URL to prevent open-redirect attacks
    const callbackUrl = validateCallbackUrl(rawCallbackUrl, url.origin);

    const loginUrl = new URL(routes.auth.login.url, url.origin);

    // Only set callbackUrl if it's safe (internal URL)
    if (callbackUrl) {
      loginUrl.searchParams.set('callbackUrl', callbackUrl);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

/**
 * Middleware configuration.
 * Defines which routes the middleware should run on.
 */
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
