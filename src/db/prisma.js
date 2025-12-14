// src/db/prisma.js
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// clean shutdown (nice in dev + tests)
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
