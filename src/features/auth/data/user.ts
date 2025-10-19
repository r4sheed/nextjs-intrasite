import { User } from '@prisma/client';

import prisma from '@/lib/prisma';

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    // TODO: Implement logging
    console.error(`DATABASE ERROR fetching user by userId ${userId}:`, error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    // TODO: Implement logging
    console.error(`DATABASE ERROR fetching user by email ${email}:`, error);
    return null;
  }
}
