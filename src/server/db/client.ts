/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// eslint-disable-next-line import/prefer-default-export
export const prisma = global.prisma || new PrismaClient({ /* log: ["query"] */ });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
