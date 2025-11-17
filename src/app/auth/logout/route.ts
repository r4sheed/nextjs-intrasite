import { NextResponse } from 'next/server';

import { routes } from '@/lib/routes';

import { logoutUser } from '@/features/auth/actions/logout-user';
import { currentUser } from '@/features/auth/lib/auth-utils';

export async function GET() {
  const user = await currentUser();

  // Call the server action that performs sign out
  if (user) {
    await logoutUser();
  }

  return NextResponse.redirect(routes.home.url);
}
