"use client";

// survey-progress.ts — 설문 진행 상태(step + answers)를 localStorage에 보관해
// 새로고침이나 뒤로가기로 /survey에 다시 돌아와도 같은 화면(결과 화면 포함)을
// 그대로 복원할 수 있게 한다.

import { STORAGE_KEYS } from "../lib/config";
import type { SurveyAnswers, SurveyStep } from "./page";

interface SurveyProgress {
  step: SurveyStep;
  answers: SurveyAnswers;
}

export function getSurveyProgress(): SurveyProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SURVEY_PROGRESS);
    return raw ? (JSON.parse(raw) as SurveyProgress) : null;
  } catch {
    return null;
  }
}

export function saveSurveyProgress(progress: SurveyProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.SURVEY_PROGRESS,
      JSON.stringify(progress),
    );
  } catch {
    // 저장 실패(용량 초과 등)는 설문 흐름을 막지 않는다.
  }
}
