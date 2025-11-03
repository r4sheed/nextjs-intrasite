import { NextResponse } from 'next/server';

import { routes } from '@/lib/navigation';
import {
  AUTH_ROUTE_PREFIX,
  authRouteSet,
  DEFAULT_LOGIN_REDIRECT,
  protectedRouteSet,
  publicRouteSet,
} from '@/lib/routes';

import { auth } from '@/features/auth/lib/auth';

/**
 * Next.js middleware for authentication and route protection.
 *
 * This middleware checks if the user is authenticated and redirects accordingly:
 * - Allows API auth routes.
 * - Redirects logged-in users away from auth pages.
 * - Redirects unauthenticated users from protected routes to login with callback.
 *
 * @param req - The incoming request object with auth property.
 * @returns NextResponse for redirects or NextResponse.next() to continue.
 */
export default auth(req => {
  const isLoggedIn = !!req.auth;

  const url = req.nextUrl ?? new URL(req.url);
  const pathname = url.pathname;

  const isApiAuthRoute = pathname.startsWith(AUTH_ROUTE_PREFIX);
  const isPublicRoute = publicRouteSet.has(pathname);
  const isAuthRoute = authRouteSet.has(pathname);
  const isExplicitProtectedRoute = protectedRouteSet.has(pathname);

  const isProtectedRoute =
    isExplicitProtectedRoute || (!isPublicRoute && !isAuthRoute);

  // Allow internal API Auth Routes (e.g., NextAuth/Auth.js internal calls)
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect Logged-in Users from Auth Routes (e.g /login or /signup pages)
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, url));
  }

  // Redirect Unauthenticated Users from Protected Routes
  if (!isLoggedIn && isProtectedRoute) {
    const callbackUrl = `${pathname}${url.search}`;

    const loginUrl = new URL(routes.auth.login.url, url.origin);
    loginUrl.searchParams.set('callbackUrl', callbackUrl);

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
