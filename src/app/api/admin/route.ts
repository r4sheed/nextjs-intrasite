import { UserRole } from '@prisma/client';

import { NextResponse } from 'next/server';

import { currentUserRole } from '@/lib/auth';
import { HTTP_STATUS } from '@/lib/http-status';

export async function GET() {
  const role = await currentUserRole();

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: HTTP_STATUS.ACCEPTED });
  }

  return new NextResponse(null, { status: HTTP_STATUS.FORBIDDEN });
}
