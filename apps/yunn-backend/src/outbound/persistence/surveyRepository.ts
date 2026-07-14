import { PrismaClient } from "../../generated/prisma/client.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) as any,
});

export class SurveyRepository {
  // 설문 데이터 저장
  async create(data: Prisma.SurveySubmissionCreateInput) {
    return prisma.surveySubmission.create({
      data,
    });
  }

  // 해당 sessionId의 최신 설문 1개 조회
  async findLatestBySessionId(sessionId: string) {
    return prisma.surveySubmission.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });
  }
}
