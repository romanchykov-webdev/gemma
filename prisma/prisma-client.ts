// import { PrismaClient } from '@prisma/client';
//
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
//
// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ['query', 'error', 'warn'],
//   });
//
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// в dev кладём инстанс в globalThis, чтобы не плодились новые
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
