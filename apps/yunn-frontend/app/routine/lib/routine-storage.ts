"use client";

// routine-storage.ts — 루틴 트래킹 localStorage 접근 계층 + API 동기화
//
// localStorage 직접 접근은 이 파일에서만 한다. Domain/Screen은 이 파일을 통해서만 저장소에 접근한다.

import { STORAGE_KEYS } from "@/app/lib/config";
import { updateRoutine } from "@/app/lib/api-client";
import { getSessionId } from "@/app/lib/analytics";

export interface PendingResultData {
  skinType: string;
  concernType: string;
  gender: string;
  name: string;
  email: string;
  campaign: string;
}

export interface DayChecks {
  morning: boolean[];
  evening: boolean[];
}

export type RoutineChecks = Record<string, DayChecks>;

export interface RoutinePhoto {
  dataUrl: string;
  date: string;
}

function readJSON<T>(key: string): T | null {
  // SSR 환경에서는 localStorage가 없으므로 바로 null 반환
  if (typeof window === "undefined") return null;
  try {
    // 저장된 JSON 문자열을 파싱해 반환
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // 파싱 실패 시 손상된 값으로 간주하고 null 반환
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    // 값을 JSON 문자열로 직렬화해 저장
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 best-effort — 사용자 흐름을 막지 않는다.
  }
}

// ── 설문 결과 (survey 완료 시 ResultScreen이 저장, routine이 읽음) ──────────
export function getPendingResult(): PendingResultData | null {
  return readJSON<PendingResultData>(STORAGE_KEYS.PENDING_RESULT);
}

export function savePendingResult(data: PendingResultData) {
  writeJSON(STORAGE_KEYS.PENDING_RESULT, data);
}

// ── 루틴 시작일 ──────────────────────────────────────────────────────────
export function getRoutineStart(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.ROUTINE_START);
}

export function saveRoutineStart(dateKey: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.ROUTINE_START, dateKey);
}

// ── 일자별 스텝 체크 ─────────────────────────────────────────────────────
export function getChecks(): RoutineChecks {
  return readJSON<RoutineChecks>(STORAGE_KEYS.ROUTINE_CHECKS) ?? {};
}

export function saveChecks(checks: RoutineChecks) {
  writeJSON(STORAGE_KEYS.ROUTINE_CHECKS, checks);
}

// localStorage와 API 서버에 체크 데이터를 저장한다 (비동기)
export async function saveChecksWithSync(checks: RoutineChecks, dateKey: string) {
  // localStorage에 저장 (동기)
  saveChecks(checks);

  // API 서버로도 동기화 (비동기, 실패해도 로컬 저장은 유지)
  const dayChecks = checks[dateKey];
  if (dayChecks) {
    try {
      await updateRoutine(getSessionId(), {
        dateKey,
        morning: dayChecks.morning,
        evening: dayChecks.evening,
      });
    } catch (error) {
      console.warn("[saveChecksWithSync] API update failed:", error);
    }
  }
}

// ── Before/After 사진 ────────────────────────────────────────────────────
export function getBeforePhoto(): RoutinePhoto | null {
  return readJSON<RoutinePhoto>(STORAGE_KEYS.PHOTO_BEFORE);
}

export function saveBeforePhoto(photo: RoutinePhoto) {
  writeJSON(STORAGE_KEYS.PHOTO_BEFORE, photo);
}

export function getAfterPhoto(): RoutinePhoto | null {
  return readJSON<RoutinePhoto>(STORAGE_KEYS.PHOTO_AFTER);
}

export function saveAfterPhoto(photo: RoutinePhoto) {
  writeJSON(STORAGE_KEYS.PHOTO_AFTER, photo);
}
