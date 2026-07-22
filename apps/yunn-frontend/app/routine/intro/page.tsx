"use client";

// page.tsx — /routine/intro: ResultScreen의 "Get My 14-Day Plan" CTA와
// 실제 루틴 시작(Before 사진, /routine)을 잇는 루틴 소개 화면.
// 여기서 설문/사진 촬영이 시작되진 않는다 — 루틴 트래킹이 주는 혜택을 보여준 뒤 /routine으로 넘긴다.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/app/lib/analytics";
import BenefitCard from "./components/BenefitCard";
import InfoRow from "./components/InfoRow";

const BENEFITS = [
  {
    icon: "/images/Calender.webp",
    title: "Personalized Routine",
    description: "A personalized AM & PM routine built for your skin.",
  },
  {
    icon: "/images/ElectricBulb.webp",
    title: "Skin Care Tips",
    description: "Easy daily tips based on your skin condition.",
  },
  {
    icon: "/images/Star.webp",
    title: "Weekly Care Guide",
    description: "Build healthy skincare habits step by step.",
  },
];

export default function RoutineIntroPage() {
  const router = useRouter();

  useEffect(() => {
    trackEvent("routine_intro_view");
  }, []);

  const handleStart = () => {
    trackEvent("routine_intro_cta_click");
    router.push("/survey/feedback");
  };

  return (
    <div className="relative min-h-screen w-full max-w-phone-max mx-auto overflow-hidden bg-linear-to-b from-[#EAFBF6] via-[#F4FDFB] to-white">
      {/* 배경 블러 장식 */}
      <div
        className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-6 -right-14 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative px-shell-x pb-10 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent text-2xl text-ink"
        >
          <i className="ph ph-arrow-left"></i>
        </button>

        <div className="mt-4 text-center">
          <h1 className="mt-4 text-[26px] font-bold leading-[1.25] text-ink">
            Unlock Your Personalized
            <br />
            <span className="text-primary">14-Day Skin Plan</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[280px] text-[14px] leading-[1.5] text-ink-faint">
            You&apos;re one step away from your personalized skincare plan.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-line" />
          <span className="text-[13px] font-bold text-primary">
            What You&apos;ll Get
          </span>
          <span className="h-px w-8 bg-line" />
        </div>

        <div className="mt-4 flex flex-col items-stretch">
          {BENEFITS.map((benefit, i) => (
            <div key={benefit.title}>
              <BenefitCard {...benefit} />
              {i < BENEFITS.length - 1 && (
                <div
                  className="mx-auto h-4 w-px border-l border-dashed border-primary/40"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <InfoRow icon="ph ph-clock">About 1 minute</InfoRow>
          <InfoRow icon="ph ph-lock-simple">
            Your feedback helps improve YUNN. Nothing else.
          </InfoRow>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-8 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-primary text-[16px] font-bold text-white transition-transform active:scale-[0.98]"
        >
          Start My Routine
          <i className="ph ph-arrow-right text-lg"></i>
        </button>
      </div>
    </div>
  );
}
