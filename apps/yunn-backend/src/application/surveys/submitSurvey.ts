import { SurveyRepository } from "../../outbound/persistence/surveyRepository.js";
import { toConcernKey } from "../../shared/utils/normalize.js";
import type { SurveySubmitRequest, SurveySubmitResponse } from "../../shared/schemas/surveys.js";

const surveyRepository = new SurveyRepository();

// 설문을 저장하고 결과를 반환합니다
export async function submitSurvey(
  request: SurveySubmitRequest
): Promise<{ resultSkinType: string | null; resultConcernType: string | null; sessionId: string; createdAt: string }> {
  // resultSkinType은 skinType과 동일
  const resultSkinType = request.skinType || null;
  // resultConcernType은 concerns를 정규화
  const resultConcernType = toConcernKey(request.concerns) || null;

  // DB에 저장
  const survey = await surveyRepository.create({
    sessionId: request.sessionId,
    city: request.city ?? null,
    gender: request.gender ?? null,
    age: request.age ?? null,
    skinType: request.skinType ?? null,
    concerns: request.concerns ?? null,
    trigger: request.trigger ?? [],
    sensitivity: request.sensitivity ?? null,
    outdoor: request.outdoor ?? null,
    sunscreen: request.sunscreen ?? null,
    sleep: request.sleep ?? null,
    stress: request.stress ?? null,
    routineLevel: request.routineLevel ?? null,
    photoUploaded: request.photoUploaded,
    resultSkinType,
    resultConcernType,
  });

  return {
    resultSkinType,
    resultConcernType,
    sessionId: survey.sessionId,
    createdAt: survey.createdAt.toISOString(),
  };
}
