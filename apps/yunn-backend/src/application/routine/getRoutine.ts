import { RoutineRepository } from "../../outbound/persistence/routineRepository.js";
import { NotFoundError } from "../../shared/errors/AppError.js";
import type { RoutineGetResponse } from "../../shared/schemas/routine.js";

const routineRepository = new RoutineRepository();

// 루틴 데이터를 조회합니다 (startDate + 모든 날짜별 체크)
export async function getRoutine(sessionId: string): Promise<RoutineGetResponse> {
  const routineChecks = await routineRepository.findBySessionId(sessionId);

  if (routineChecks.length === 0) {
    throw new NotFoundError("루틴을 시작하지 않았습니다");
  }

  // 날짜별로 그룹화
  const checks: Record<string, { morning: boolean[]; evening: boolean[] }> = {};
  for (const check of routineChecks) {
    checks[check.dateKey] = {
      morning: check.morning!,
      evening: check.evening!,
    };
  }

  // startDate는 가장 오래된 dateKey (첫 번째)
  const firstCheck = routineChecks[0];
  const startDate = firstCheck!.dateKey;

  return {
    startDate,
    checks,
  };
}
