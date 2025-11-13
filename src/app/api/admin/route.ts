import { UserRole } from '@prisma/client';

import { NextResponse } from 'next/server';

import { HTTP_STATUS } from '@/lib/http-status';

import { currentUserRole } from '@/features/auth/lib/auth-utils';

export async function GET() {
  const role = await currentUserRole();

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: HTTP_STATUS.ACCEPTED });
  }

  return new NextResponse(null, { status: HTTP_STATUS.FORBIDDEN });
}
