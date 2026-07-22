"use client";

// feedback-sheet.ts — 피드백 설문 답변을 Google Sheets로 전송한다.

import { getSessionId } from "@/app/lib/analytics";
import { sendToSheet, type SheetPayload } from "@/app/lib/sheet-repository";
import type { FeedbackAnswers } from "./feedback/page";

// Sheets 컬럼 순서를 문서처럼 읽을 수 있게 명시한 피드백 설문 schema다.
export const FEEDBACK_SHEET_COLUMNS = [
  "app_source",
  "app_name",
  "session_id",
  "completed_at",
  "page_path",
  "usefulness",
  "accuracy",
  "routine_confidence",
  "recommend",
  "unlock_reason",
  "help_wishlist",
  "weekly_use_reason",
  "daily_guidance_value",
  "start_likelihood",
] as const;

// 피드백 설문 답변을 Sheets 형식으로 변환한다.
export function buildFeedbackSheetPayload(answers: FeedbackAnswers): SheetPayload {
  return {
    app_source: "next",
    app_name: "yunn-mobile-react",
    session_id: getSessionId(),
    completed_at: new Date().toISOString(),
    page_path: typeof window === "undefined" ? "" : window.location.pathname,
    usefulness: answers.usefulness || "",
    accuracy: answers.accuracy || "",
    routine_confidence: answers.routineConfidence || "",
    recommend: answers.recommend || "",
    unlock_reason: answers.unlockReason || "",
    help_wishlist: answers.helpWishlist || "",
    weekly_use_reason: answers.weeklyUseReason || "",
    daily_guidance_value: answers.dailyGuidanceValue || "",
    start_likelihood: answers.startLikelihood || "",
  };
}

// 피드백 설문 완료 row를 Google Sheets로 전송한다.
export async function sendFeedbackCompletionToSheet(answers: FeedbackAnswers) {
  try {
    await sendToSheet(buildFeedbackSheetPayload(answers));
  } catch (error) {
    console.warn("[sendFeedbackCompletionToSheet] Google Sheets send failed:", error);
  }
}
