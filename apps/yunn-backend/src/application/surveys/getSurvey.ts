import { SurveyRepository } from "../../outbound/persistence/surveyRepository.js";
import { NotFoundError } from "../../shared/errors/AppError.js";
import type { SurveyGetResponse } from "../../shared/schemas/surveys.js";

const surveyRepository = new SurveyRepository();

// 최신 설문 결과를 조회합니다
export async function getSurvey(sessionId: string): Promise<SurveyGetResponse> {
  const survey = await surveyRepository.findLatestBySessionId(sessionId);

  if (!survey) {
    throw new NotFoundError("진단 결과를 찾을 수 없습니다");
  }

  return {
    skinType: survey.resultSkinType,
    concernType: survey.resultConcernType,
    gender: survey.gender,
    age: survey.age,
    city: survey.city,
    photoUploaded: survey.photoUploaded,
    createdAt: survey.createdAt.toISOString(),
  };
}
