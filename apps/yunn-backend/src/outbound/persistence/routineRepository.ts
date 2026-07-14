import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../shared/lib/prisma.js";

export class RoutineRepository {
  // 루틴 체크를 저장 또는 업데이트합니다 (upsert)
  async upsert(
    sessionId: string,
    dateKey: string,
    data: { morning: boolean[]; evening: boolean[] }
  ) {
    return prisma.routineCheck.upsert({
      where: {
        sessionId_dateKey: { sessionId, dateKey },
      },
      update: data,
      create: {
        sessionId,
        dateKey,
        ...data,
      },
    });
  }

  // 해당 sessionId의 모든 루틴 체크를 조회합니다
  async findBySessionId(sessionId: string) {
    return prisma.routineCheck.findMany({
      where: { sessionId },
      orderBy: { dateKey: "asc" },
    });
  }
}
