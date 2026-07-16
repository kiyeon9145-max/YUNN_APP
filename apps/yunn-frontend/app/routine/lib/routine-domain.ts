// routine-domain.ts — 루틴 트래킹 순수 비즈니스 로직
//
// DOM 조작, localStorage 접근, GTM 전송을 하지 않는다. 입력값만으로 결과를 반환하는 순수 함수만 둔다.

import { ROUTINE_CONFIG } from "@/app/lib/config";
import type { DayChecks, RoutineChecks } from "./routine-storage";

// Date → "YYYY-MM-DD" (로컬 타임존 기준)
export function getDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 루틴 시작일 기준 며칠차인지 (1-indexed)
export function getDay(startDateKey: string, today: Date = new Date()): number {
  // 시작일과 오늘을 자정 기준으로 맞춰 시간대 오차 없이 날짜 차이만 계산
  const start = new Date(`${startDateKey}T00:00:00`);
  const current = new Date(getDayKey(today) + "T00:00:00");
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  // 1-indexed로 변환 (시작일 = Day 1)
  return Math.max(1, diffDays + 1);
}

export function getProgress(
  dayChecks: DayChecks | undefined,
): { done: number; total: number } {
  if (!dayChecks) return { done: 0, total: 0 };
  const done =
    dayChecks.morning.filter(Boolean).length +
    dayChecks.evening.filter(Boolean).length;
  const total = dayChecks.morning.length + dayChecks.evening.length;
  return { done, total };
}

function isDayDone(dayChecks: DayChecks | undefined): boolean {
  if (!dayChecks) return false;
  return dayChecks.morning.some(Boolean) || dayChecks.evening.some(Boolean);
}

// 연속 수행일 — 오늘부터 거꾸로 훑어서 morning 또는 evening 중 하나라도 완료된 날이 끊길 때까지 센다.
export function getStreak(
  checks: RoutineChecks,
  startDateKey: string,
  today: Date = new Date(),
): number {
  const totalDays = getDay(startDateKey, today);
  let streak = 0;
  const cursor = new Date(getDayKey(today) + "T00:00:00");

  // 오늘부터 하루씩 거꾸로 훑다가 완료되지 않은 날을 만나면 멈춘다
  for (let i = 0; i < totalDays; i += 1) {
    const key = getDayKey(cursor);
    if (!isDayDone(checks[key])) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function isBeforeAfterUnlocked(day: number): boolean {
  return day >= ROUTINE_CONFIG.BEFORE_AFTER_UNLOCK_DAY;
}
