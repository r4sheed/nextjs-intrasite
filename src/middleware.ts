import { NextResponse } from 'next/server';

import { routes } from '@/lib/navigation';
import {
  AUTH_ROUTE_PREFIX,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from '@/lib/routes';

import { auth } from '@/features/auth/lib/auth';

export default auth(req => {
  const isLoggedIn = !!req.auth;

  // Safely get URL and pathname
  const url = req.nextUrl ?? new URL(req.url);
  const pathname = url.pathname;

  // Determine the type of route
  const isApiAuthRoute = pathname.startsWith(AUTH_ROUTE_PREFIX);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  // A route is protected if it is neither public nor an authentication route.
  const isProtectedRoute = !isPublicRoute && !isAuthRoute;

  // Allow internal API Auth Routes (e.g., NextAuth/Auth.js internal calls)
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect Logged-in Users from Auth Routes (e.g /login or /signup pages)
  if (isLoggedIn && isAuthRoute) {
    console.log(
      `Redirecting authenticated user from ${pathname} to ${DEFAULT_LOGIN_REDIRECT}`
    );
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, url));
  }

  // Redirect Unauthenticated Users from Protected Routes
  if (!isLoggedIn && isProtectedRoute) {
    console.log(
      `Redirecting unauthenticated user from protected route ${pathname}`
    );

    // Construct the full callback URL (path + search params)
    let callbackUrl = pathname;
    if (url.search) {
      callbackUrl += url.search;
    }

    const loginUrl = new URL(routes.auth.login.url, url.origin);
    // Add the callback URL as a search parameter so the user returns after login
    loginUrl.searchParams.set('callbackUrl', callbackUrl);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
