"use client";

// survey-sheet.ts — React 설문 답변을 Google Sheets와 API 서버로 전송한다.

import { getSessionId } from "../lib/analytics";
import { sendToSheet, type SheetPayload } from "../lib/sheet-repository";
import { submitSurvey, type SurveySubmitRequest } from "../lib/api-client";
import { SurveyAnswersSchema } from "../lib/schemas/survey";
import { toConcernKey } from "./result-data";
import type { SurveyAnswers } from "./page";

interface SendSurveySheetOptions {
  photoUploaded: boolean;
}

// 설문 답변이 유효한 형식인지 검증하고 로깅한다. (모니터링 용도)
function validateSurveyAnswers(answers: SurveyAnswers): void {
  const result = SurveyAnswersSchema.safeParse(answers);

  if (!result.success) {
    console.warn("[validateSurveyAnswers] Validation failed:", result.error.flatten());
  }
}

// Sheets 컬럼 순서를 문서처럼 읽을 수 있게 명시한 비식별 설문 완료 schema다.
export const SURVEY_SHEET_COLUMNS = [
  "app_source",
  "app_name",
  "session_id",
  "completed_at",
  "page_path",
  "city",
  "gender",
  "age",
  "skin_type",
  "concern",
  "trigger",
  "sensitivity",
  "outdoor",
  "sunscreen",
  "sleep",
  "stress",
  "routine_level",
  "photo_uploaded",
  "result_skin_type",
  "result_concern_type",
] as const;

// 검증된 설문 답변을 Sheets 형식으로 변환한다. (데이터 형식화만 담당)
export function buildSurveySheetPayload(
  answers: SurveyAnswers,
  { photoUploaded }: SendSurveySheetOptions,
): SheetPayload {
  const concernType = toConcernKey(answers.concerns || "Acne");

  return {
    app_source: "next",
    app_name: "yunn-mobile-react",
    session_id: getSessionId(),
    completed_at: new Date().toISOString(),
    page_path: typeof window === "undefined" ? "" : window.location.pathname,
    city: answers.city,
    gender: answers.gender,
    age: answers.age,
    skin_type: answers.skinType,
    concern: answers.concerns,
    trigger: answers.trigger ?? [],
    sensitivity: answers.sensitivity,
    outdoor: answers.outdoor,
    sunscreen: answers.sunscreen,
    sleep: answers.sleep,
    stress: answers.stress,
    routine_level: answers.routineLevel,
    photo_uploaded: photoUploaded,
    result_skin_type: answers.skinType,
    result_concern_type: concernType,
  };
}

// 설문 완료 row를 Google Sheets와 API 서버로 전송한다.
// 1. 검증 (유효한 형식인가? - 로깅만)
// 2. Sheets 변환 및 전송
// 3. API 서버로도 전송
// 4. 실패해도 화면 전환은 계속됨
export async function sendSurveyCompletionToSheet(
  answers: SurveyAnswers,
  options: SendSurveySheetOptions,
) {
  validateSurveyAnswers(answers);

  // Google Sheets 전송 (기존 방식)
  const sheetPromise = sendToSheet(buildSurveySheetPayload(answers, options));

  // API 서버 전송 (새로운 방식)
  const apiPromise = submitSurvey({
    sessionId: getSessionId(),
    photoUploaded: options.photoUploaded,
    gender: answers.gender,
    age: answers.age,
    city: answers.city,
    skinType: answers.skinType,
    concerns: answers.concerns,
    trigger: answers.trigger,
    sensitivity: answers.sensitivity,
    outdoor: answers.outdoor,
    sunscreen: answers.sunscreen,
    sleep: answers.sleep,
    stress: answers.stress,
    routineLevel: answers.routineLevel,
  }).catch((error) => {
    console.warn("[sendSurveyCompletionToSheet] API submit failed:", error);
  });

  return Promise.all([sheetPromise, apiPromise]);
}
