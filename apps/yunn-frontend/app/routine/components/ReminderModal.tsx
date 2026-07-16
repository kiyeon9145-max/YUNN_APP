"use client";

// ReminderModal.tsx — 접속 시간 기반 아침/저녁 루틴 알림 모달
// AppConfig의 시간대(MORNING/EVENING START~END HOUR) 안에 접속했고
// 이 세션에서 아직 안 본 경우에만 표시한다 (sessionStorage로 재표시 방지).

import { useEffect, useState } from "react";
import { ROUTINE_CONFIG } from "@/app/lib/config";

const DISMISS_KEY = "yunn_routine_reminder_dismissed";

type Period = "morning" | "evening";

function currentPeriod(): Period | null {
  const hour = new Date().getHours();
  if (hour >= ROUTINE_CONFIG.MORNING_START_HOUR && hour < ROUTINE_CONFIG.MORNING_END_HOUR) {
    return "morning";
  }
  if (hour >= ROUTINE_CONFIG.EVENING_START_HOUR && hour < ROUTINE_CONFIG.EVENING_END_HOUR) {
    return "evening";
  }
  return null;
}

export default function ReminderModal() {
  const [period, setPeriod] = useState<Period | null>(null);

  useEffect(() => {
    const p = currentPeriod();
    if (!p) return;
    if (window.sessionStorage.getItem(DISMISS_KEY) === p) return;
    setPeriod(p);
  }, []);

  const dismiss = () => {
    if (period) window.sessionStorage.setItem(DISMISS_KEY, period);
    setPeriod(null);
  };

  if (!period) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={dismiss}
    >
      <div
        className="w-[280px] rounded-[12px] bg-white p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-[28px]">{period === "morning" ? "☀️" : "🌙"}</div>
        <div className="mb-1 text-[16px] font-bold text-black">
          {period === "morning" ? "Good morning" : "Good evening"}
        </div>
        <p className="mb-4 text-[13px] text-[#666]">
          {period === "morning"
            ? "Time for your morning routine."
            : "Time for your evening routine."}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="h-[42px] w-full cursor-pointer rounded-[6px] border-0 bg-primary text-[14px] font-bold text-white"
        >
          Let&apos;s go
        </button>
      </div>
    </div>
  );
}
