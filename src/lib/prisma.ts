import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

import { env } from '@/lib/env';

/**
 * Creates a singleton PrismaClient instance with Accelerate extension.
 * This ensures a single database connection across the application.
 *
 * @returns Configured PrismaClient with Accelerate extension
 */
const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

/**
 * Global Prisma database instance.
 * Uses singleton pattern to avoid multiple connections in development.
 * In production, a new instance is created per serverless function.
 */
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

/**
 * Exported database instance for use throughout the application.
 */
export const db = prisma;

// Persist the instance in development to avoid connection issues during hot reloads
if (env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
