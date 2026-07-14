import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../shared/lib/prisma.js";

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
