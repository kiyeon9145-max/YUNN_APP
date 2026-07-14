import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma Client 싱글톤
let prisma: InstanceType<typeof PrismaClient>;

// Prisma 초기화 함수
function initializePrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return new PrismaClient({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: new PrismaPg({ connectionString }) as any,
  });
}

if (process.env.NODE_ENV === "production") {
  prisma = initializePrisma();
} else {
  // 개발 환경에서 인스턴스 재사용
  const globalForPrisma = globalThis as unknown as { prisma: typeof prisma };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = initializePrisma();
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
