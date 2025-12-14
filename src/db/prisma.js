let prisma = null;

if (process.env.DB_ENABLED === "true") {
  const { PrismaClient } = await import("@prisma/client");
  prisma = new PrismaClient();
} else {
  console.warn("⚠️ DB disabled – running without Prisma");
}

export default prisma;
