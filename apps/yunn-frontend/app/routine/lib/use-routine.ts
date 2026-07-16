"use client";

// use-routine.ts — routine-storage(저장) + routine-domain(계산) + result-data(스텝 콘텐츠)를
// 결합해 화면이 바로 쓸 수 있는 상태와 핸들러를 노출하는 훅.
// AppController(어느 화면을 보여줄지 결정)와 RoutineScreen(체크 처리)의 역할을 함께 담당한다.

import { useCallback, useEffect, useMemo, useState } from "react";
import { getResultConfig, type ResultConfig } from "@/app/survey/result-data";
import {
  getAfterPhoto,
  getBeforePhoto,
  getChecks,
  getPendingResult,
  getRoutineStart,
  saveAfterPhoto as persistAfterPhoto,
  saveBeforePhoto as persistBeforePhoto,
  saveChecks,
  saveChecksWithSync,
  saveRoutineStart,
  type DayChecks,
  type PendingResultData,
  type RoutineChecks,
  type RoutinePhoto,
} from "./routine-storage";
import {
  getDay,
  getDayKey,
  getProgress,
  getStreak,
  isBeforeAfterUnlocked,
} from "./routine-domain";
import {
  trackAfterPhotoUploaded,
  trackBeforePhotoUploaded,
  trackEveningCompleted,
  trackMorningCompleted,
  trackRoutineStarted,
  trackRoutineStepChecked,
} from "@/app/lib/analytics";

export type RoutineScreenId = "loading" | "guard" | "start" | "routine" | "compare";
export type RoutinePeriod = "morning" | "evening";

function emptyDayChecks(config: ResultConfig | null): DayChecks {
  return {
    morning: config ? config.routines.morning.map(() => false) : [],
    evening: config ? config.routines.evening.map(() => false) : [],
  };
}

export function useRoutine() {
  const [ready, setReady] = useState(false);
  const [pendingResult, setPendingResult] = useState<PendingResultData | null>(null);
  const [routineStart, setRoutineStart] = useState<string | null>(null);
  const [checks, setChecks] = useState<RoutineChecks>({});
  const [beforePhoto, setBeforePhoto] = useState<RoutinePhoto | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<RoutinePhoto | null>(null);

  useEffect(() => {
    setPendingResult(getPendingResult());
    setRoutineStart(getRoutineStart());
    setChecks(getChecks());
    setBeforePhoto(getBeforePhoto());
    setAfterPhoto(getAfterPhoto());
    setReady(true);
  }, []);

  const config = useMemo<ResultConfig | null>(() => {
    if (!pendingResult) return null;
    return getResultConfig({
      name: pendingResult.name,
      gender: pendingResult.gender,
      skinType: pendingResult.skinType,
      concernType: pendingResult.concernType,
      age: "",
      sleep: "",
      stress: "",
      sensitivity: "",
      outdoor: "",
      sunscreen: "",
    });
  }, [pendingResult]);

  const dayKey = getDayKey();
  const day = routineStart ? getDay(routineStart) : 0;
  const todayChecks = checks[dayKey] ?? emptyDayChecks(config);
  const progress = getProgress(todayChecks);
  const streak = routineStart ? getStreak(checks, routineStart) : 0;
  const unlocked = isBeforeAfterUnlocked(day);

  const screen: RoutineScreenId = !ready
    ? "loading"
    : !pendingResult
      ? "guard"
      : !routineStart
        ? "start"
        : unlocked && afterPhoto
          ? "compare"
          : "routine";

  // Before 사진 촬영과 함께 루틴 시작
  const startRoutine = useCallback(
    (photo: RoutinePhoto) => {
      const startKey = getDayKey();
      saveRoutineStart(startKey);
      persistBeforePhoto(photo);
      setRoutineStart(startKey);
      setBeforePhoto(photo);
      if (pendingResult) {
        trackRoutineStarted(1, pendingResult.skinType, pendingResult.concernType);
      }
      trackBeforePhotoUploaded();
    },
    [pendingResult],
  );

  // 스텝 체크/해제 → 저장 + 진행률 갱신 + 분석 이벤트
  // setState 업데이터 함수는 React StrictMode에서 두 번 호출될 수 있으므로
  // 그 안에 분석 이벤트 같은 부수효과를 넣지 않고, next state를 미리 계산해 밖에서 처리한다.
  const toggleStep = useCallback(
    (period: RoutinePeriod, index: number) => {
      if (!config) return;
      const stepName = config.routines[period][index]?.name ?? "";

      const prevDay = checks[dayKey] ?? emptyDayChecks(config);
      const nextPeriodArr = [...prevDay[period]];
      nextPeriodArr[index] = !nextPeriodArr[index];
      const nextDay: DayChecks = { ...prevDay, [period]: nextPeriodArr };
      const next = { ...checks, [dayKey]: nextDay };

      saveChecks(next);
      saveChecksWithSync(next, dayKey).catch(() => {
        // API 동기화 실패해도 로컬 저장은 유지됨
      });
      setChecks(next);

      trackRoutineStepChecked(day, period, index, stepName);
      if (nextPeriodArr.length > 0 && nextPeriodArr.every(Boolean)) {
        if (period === "morning") trackMorningCompleted(day);
        else trackEveningCompleted(day);
      }
    },
    [config, dayKey, day, checks],
  );

  // After 사진 업로드 (Day 14+에만 화면에서 노출)
  const completeAfterPhoto = useCallback((photo: RoutinePhoto) => {
    persistAfterPhoto(photo);
    setAfterPhoto(photo);
    trackAfterPhotoUploaded(day);
  }, [day]);

  return {
    ready,
    screen,
    pendingResult,
    config,
    day,
    dayKey,
    streak,
    progress,
    todayChecks,
    beforePhoto,
    afterPhoto,
    unlocked,
    startRoutine,
    toggleStep,
    completeAfterPhoto,
  };
}
