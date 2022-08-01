// src/server/db/client.ts
import { PrismaClient } from "@prisma/client";
import { env } from "../env.mjs";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
  });

global.prisma = prisma;
