import { RoutineRepository } from "../../outbound/persistence/routineRepository.js";
import type { RoutineUpdateRequest, RoutineUpdateResponse } from "../../shared/schemas/routine.js";

const routineRepository = new RoutineRepository();

// 루틴 체크를 저장하거나 업데이트합니다
export async function updateRoutine(
  sessionId: string,
  request: RoutineUpdateRequest
): Promise<RoutineUpdateResponse> {
  await routineRepository.upsert(sessionId, request.dateKey, {
    morning: request.morning,
    evening: request.evening,
  });

  return {
    dateKey: request.dateKey,
    morning: request.morning,
    evening: request.evening,
  };
}
