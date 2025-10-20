import { NextResponse } from 'next/server';

import { auth } from '@/features/auth/lib/auth';
import { ROUTES } from '@/lib/navigation';
import {
  AUTH_ROUTES,
  AUTH_ROUTE_PREFIX,
  DEFAULT_LOGIN_REDIRECT,
  PUBLIC_ROUTES,
} from '@/lib/routes';

export default auth(req => {
  const isLoggedIn = !!req.auth;

  const url = req.nextUrl ?? new URL(req.url);
  const pathname = url.pathname;

  const isApiAuthRoute = pathname.startsWith(AUTH_ROUTE_PREFIX);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isApiAuthRoute) return NextResponse.next();

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, url));
  }

  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    console.log('Redirecting unauthenticated user:', pathname);
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, url.origin));
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
