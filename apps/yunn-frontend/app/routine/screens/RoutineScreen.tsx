"use client";

// RoutineScreen.tsx — Day 카운터 + Streak + 아침/저녁 체크리스트 메인 화면

import { useState } from "react";
import type { ResultConfig, RoutineStep } from "@/app/survey/result-data";
import type { DayChecks, RoutinePhoto } from "../lib/routine-storage";
import type { RoutinePeriod } from "../lib/use-routine";
import PhotoCapture from "../components/PhotoCapture";

interface RoutineScreenProps {
  day: number;
  streak: number;
  progress: { done: number; total: number };
  todayChecks: DayChecks;
  config: ResultConfig;
  unlocked: boolean;
  afterPhoto: RoutinePhoto | null;
  onToggleStep: (period: RoutinePeriod, index: number) => void;
  onAfterPhoto: (photo: RoutinePhoto) => void;
}

export default function RoutineScreen({
  day,
  streak,
  progress,
  todayChecks,
  config,
  unlocked,
  afterPhoto,
  onToggleStep,
  onAfterPhoto,
}: RoutineScreenProps) {
  const [activePeriod, setActivePeriod] = useState<RoutinePeriod>("morning");
  const steps = config.routines[activePeriod];
  const checksForPeriod = todayChecks[activePeriod];
  const progressPct = progress.total ? (progress.done / progress.total) * 100 : 0;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[393px] bg-white pb-10">
      <header className="px-6 pb-4 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-[#999]">Day {day} / 14</div>
            <h1 className="text-[20px] font-bold text-black">{config.skinTypeName}</h1>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-[#FFF3E0] px-3 py-1 text-[12px] font-bold text-[#E08A00]">
              🔥 {streak} Day Streak
            </div>
          )}
        </div>
        <div className="mt-4 h-[6px] overflow-hidden rounded-full bg-[#EAEAEA]">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1 text-[12px] text-[#666]">
          {progress.done}/{progress.total} steps done
        </div>
      </header>

      {/* Day 14 이상 & After 미업로드일 때만 노출되는 배너 */}
      {unlocked && !afterPhoto && (
        <section className="mx-6 mb-4 rounded-[8px] border border-primary bg-[#F0FAF7] p-4">
          <div className="mb-2 text-[13px] font-bold text-black">
            Day 14 reached — time for your After photo!
          </div>
          <PhotoCapture buttonLabel="Take After Photo" onCapture={onAfterPhoto} />
        </section>
      )}

      <div className="mx-6 mb-4 grid grid-cols-2 gap-1 rounded-[6px] bg-[#F5F5F5] p-1">
        <button
          type="button"
          onClick={() => setActivePeriod("morning")}
          className={tabClass(activePeriod === "morning")}
        >
          Morning Routine
        </button>
        <button
          type="button"
          onClick={() => setActivePeriod("evening")}
          className={tabClass(activePeriod === "evening")}
        >
          Evening Routine
        </button>
      </div>

      <div className="mx-6 flex flex-col gap-3">
        {steps.map((step, i) => (
          <RoutineStepCard
            key={step.name + i}
            step={step}
            checked={!!checksForPeriod[i]}
            onToggle={() => onToggleStep(activePeriod, i)}
          />
        ))}
      </div>
    </div>
  );
}

function tabClass(active: boolean): string {
  return `h-[36px] cursor-pointer rounded-[5px] border-0 text-[13px] font-bold ${
    active ? "bg-white text-primary shadow-sm" : "bg-transparent text-[#999]"
  }`;
}

function RoutineStepCard({
  step,
  checked,
  onToggle,
}: {
  step: RoutineStep;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex cursor-pointer items-center gap-3 rounded-[8px] border p-3 text-left ${
        checked ? "border-primary bg-[#F0FAF7]" : "border-[#EAEAEA] bg-white"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-primary bg-primary text-white" : "border-[#CCC] bg-white"
        }`}
      >
        {checked && <i className="ph-bold ph-check text-[12px]" />}
      </span>
      <span className="flex-1">
        <div className="text-[13px] font-bold text-black">{step.name}</div>
        <div className="text-[11px] text-[#999]">{step.tag}</div>
      </span>
    </button>
  );
}
