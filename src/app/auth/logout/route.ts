import { NextRequest, NextResponse } from 'next/server';

import { routes } from '@/lib/routes';

import { logoutUser } from '@/features/auth/actions/logout-user';
import { currentUser } from '@/features/auth/lib/auth-utils';

export async function GET(request: NextRequest) {
  const user = await currentUser();

  if (user) {
    await logoutUser();
  }

  return NextResponse.redirect(new URL(routes.home.url, request.url));
}
