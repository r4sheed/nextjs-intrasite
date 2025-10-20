import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/prisma';

async function main() {}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
