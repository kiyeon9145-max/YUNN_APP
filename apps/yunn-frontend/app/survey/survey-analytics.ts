"use client";

// survey-analytics.ts — 설문 퍼널 이벤트명과 payload 메타를 한 곳에서 관리한다.

import { setAnalyticsContext, trackEvent } from "../lib/analytics";
import { sendSurveyCompletionToSheet } from "./survey-sheet";
import type { SurveyAnswers, SurveyStep } from "./page";

type SurveyStepType = "intro" | "question" | "helper" | "analysis" | "result";

export type SurveyStepMeta = {
  step_id: SurveyStep;
  step_name: string;
  step_number: number | null;
  step_type: SurveyStepType;
};

// 이벤트명을 상수화해 GTM/GA4 태그 이름과 코드 호출 이름이 어긋나지 않게 한다.
export const SURVEY_ANALYTICS_EVENTS = {
  INTRO_VIEW: "survey_intro_view",
  START: "survey_start",
  STEP_VIEW: "survey_step_view",
  STEP_COMPLETE: "survey_step_complete",
  SKIN_TYPE_INFERRED: "survey_skin_type_inferred",
  COMPLETE: "survey_complete",
  ANALYSIS_VIEW: "survey_analysis_view",
} as const;

// 설문 퍼널 이벤트가 항상 같은 스텝 이름과 번호를 쓰도록 중앙에서 관리한다.
export const SURVEY_STEP_META: Record<SurveyStep, SurveyStepMeta> = {
  intro: {
    step_id: "intro",
    step_name: "intro",
    step_number: null,
    step_type: "intro",
  },
  "1": {
    step_id: "1",
    step_name: "gender_age",
    step_number: 1,
    step_type: "question",
  },
  "2": {
    step_id: "2",
    step_name: "city",
    step_number: 2,
    step_type: "question",
  },
  "3": {
    step_id: "3",
    step_name: "skin_type",
    step_number: 3,
    step_type: "question",
  },
  "3-1": {
    step_id: "3-1",
    step_name: "skin_helper_cleanse",
    step_number: 3,
    step_type: "helper",
  },
  "3-2": {
    step_id: "3-2",
    step_name: "skin_helper_after_hours",
    step_number: 3,
    step_type: "helper",
  },
  "3-3": {
    step_id: "3-3",
    step_name: "skin_helper_day",
    step_number: 3,
    step_type: "helper",
  },
  "3-4": {
    step_id: "3-4",
    step_name: "skin_helper_texture",
    step_number: 3,
    step_type: "helper",
  },
  "4": {
    step_id: "4",
    step_name: "main_concern",
    step_number: 4,
    step_type: "question",
  },
  "5": {
    step_id: "5",
    step_name: "skin_trigger",
    step_number: 5,
    step_type: "question",
  },
  "6": {
    step_id: "6",
    step_name: "sensitivity",
    step_number: 6,
    step_type: "question",
  },
  "7": {
    step_id: "7",
    step_name: "sun_habits",
    step_number: 7,
    step_type: "question",
  },
  "8": {
    step_id: "8",
    step_name: "sleep_stress",
    step_number: 8,
    step_type: "question",
  },
  "9": {
    step_id: "9",
    step_name: "routine_level",
    step_number: 9,
    step_type: "question",
  },
  "10": {
    step_id: "10",
    step_name: "skin_photo",
    step_number: 10,
    step_type: "question",
  },
  analysis: {
    step_id: "analysis",
    step_name: "analysis_loading",
    step_number: null,
    step_type: "analysis",
  },
  result: {
    step_id: "result",
    step_name: "result",
    step_number: null,
    step_type: "result",
  },
};

// 스텝 진입 이벤트를 한 곳에서 보내 퍼널 이탈 지점을 볼 수 있게 한다.
export function trackSurveyStepView(nextStep: SurveyStep) {
  const meta = SURVEY_STEP_META[nextStep];
  if (nextStep === "result") return;
  if (nextStep === "intro") {
    trackEvent(SURVEY_ANALYTICS_EVENTS.INTRO_VIEW, meta);
    return;
  }
  if (nextStep === "analysis") {
    trackEvent(SURVEY_ANALYTICS_EVENTS.ANALYSIS_VIEW, meta);
    return;
  }
  trackEvent(SURVEY_ANALYTICS_EVENTS.STEP_VIEW, meta);
}

// 질문 완료 이벤트에 답변과 스텝 메타를 함께 담아 선택 분포를 볼 수 있게 한다.
export function trackSurveyStepComplete(
  completedStep: SurveyStep,
  properties: Record<string, unknown> = {},
) {
  trackEvent(SURVEY_ANALYTICS_EVENTS.STEP_COMPLETE, {
    ...SURVEY_STEP_META[completedStep],
    ...properties,
  });
}

// 피부 타입 직접 선택과 helper 추론을 GA4에서 구분해 비교하기 위한 이벤트다.
export function trackSurveySkinTypeInferred(inferredSkinType: string) {
  trackEvent(SURVEY_ANALYTICS_EVENTS.SKIN_TYPE_INFERRED, {
    inferred_skin_type: inferredSkinType,
  });
}

// 개인정보 없이 최종 설문 결과만 GA4와 Sheets 분석의 기준 데이터로 삼는다.
export function trackSurveyComplete(
  finalAnswers: SurveyAnswers,
  photoUploaded: boolean,
) {
  setAnalyticsContext({
    city: finalAnswers.city ?? null,
    skin_concern: finalAnswers.concerns ?? null,
  });
  trackEvent(SURVEY_ANALYTICS_EVENTS.COMPLETE, {
    city: finalAnswers.city ?? null,
    gender: finalAnswers.gender ?? null,
    age: finalAnswers.age ?? null,
    skin_type: finalAnswers.skinType ?? null,
    concern: finalAnswers.concerns ?? null,
    trigger: finalAnswers.trigger ?? [],
    sensitivity: finalAnswers.sensitivity ?? null,
    outdoor: finalAnswers.outdoor ?? null,
    sunscreen: finalAnswers.sunscreen ?? null,
    sleep: finalAnswers.sleep ?? null,
    stress: finalAnswers.stress ?? null,
    routine_level: finalAnswers.routineLevel ?? null,
    photo_uploaded: photoUploaded,
  });
  sendSurveyCompletionToSheet(finalAnswers, { photoUploaded });
}

// 인트로 CTA 클릭을 설문 시작 전환율의 기준 이벤트로 남긴다.
export function trackSurveyStart() {
  trackEvent(SURVEY_ANALYTICS_EVENTS.START, { source: "intro_cta" });
}
