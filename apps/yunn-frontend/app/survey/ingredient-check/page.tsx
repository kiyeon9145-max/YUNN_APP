"use client";

// survey/ingredient-check/page.tsx — 제품 성분 미스매치 분석 입력 플로우
//
// 아침 → 저녁 → 추가 루틴 순서로 RoutineInputStep을 재사용해 사용자가 쓰는
// 제품을 카테고리별로 입력받는다. 성분 분석 결과 화면은 아직 미구현이라
// 마지막 단계는 임시 완료 안내만 보여준다.

import { useState } from "react";
import { useRouter } from "next/navigation";
import RoutineInputStep, {
  type ProductEntry,
  type RoutinePeriod,
} from "../components/routine-input-component";
import { usePageTracking } from "../../lib/use-page-tracking";
import {
  trackCategoryOptionClick,
  trackRoutineStepComplete,
  type PageId,
  type RoutineStepId,
} from "../../lib/analytics";

type FlowStep = RoutinePeriod | "done";

const STEP_TO_PAGE_ID: Record<RoutinePeriod, PageId> = {
  morning: "routine_am",
  evening: "routine_pm",
  additional: "routine_extra",
};

const STEP_TO_ROUTINE_STEP_ID: Record<RoutinePeriod, RoutineStepId> = {
  morning: "am",
  evening: "pm",
  additional: "extra",
};

export default function IngredientCheckPage() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>("morning");
  const [morning, setMorning] = useState<ProductEntry[]>([]);
  const [evening, setEvening] = useState<ProductEntry[]>([]);
  const [additional, setAdditional] = useState<ProductEntry[]>([]);

  const currentPageId = step === "done" ? null : STEP_TO_PAGE_ID[step];
  const { markConverted } = usePageTracking(currentPageId);

  // 새로 추가된 행의 카테고리를 감지해 category_option_click을 전송한다.
  // RoutineInputStep은 프레젠테이션 전용으로 유지하고, 트래킹은 이 오케스트레이터에서만 담당한다.
  const trackNewRow = (
    prev: ProductEntry[],
    next: ProductEntry[],
    routineStep: RoutineStepId,
  ) => {
    if (next.length > prev.length) {
      trackCategoryOptionClick(next[next.length - 1].category, routineStep);
    }
  };

  const handleMorningChange = (next: ProductEntry[]) => {
    trackNewRow(morning, next, "am");
    setMorning(next);
  };

  const handleEveningChange = (next: ProductEntry[]) => {
    trackNewRow(evening, next, "pm");
    setEvening(next);
  };

  const handleAdditionalChange = (next: ProductEntry[]) => {
    trackNewRow(additional, next, "extra");
    setAdditional(next);
  };

  const goNext = (routineStep: RoutineStepId, nextStep: FlowStep) => {
    trackRoutineStepComplete(routineStep);
    markConverted();
    setStep(nextStep);
  };

  return (
    <div className="mx-auto min-h-screen max-w-phone-max bg-white px-shell-x pt-8 pb-10">
      {step === "morning" && (
        <RoutineInputStep
          period="morning"
          value={morning}
          onChange={handleMorningChange}
          onNext={() => goNext("am", "evening")}
          onBack={() => router.push("/survey")}
        />
      )}

      {step === "evening" && (
        <RoutineInputStep
          period="evening"
          value={evening}
          onChange={handleEveningChange}
          onNext={() => goNext("pm", "additional")}
          onBack={() => setStep("morning")}
        />
      )}

      {step === "additional" && (
        <RoutineInputStep
          period="additional"
          value={additional}
          onChange={handleAdditionalChange}
          onNext={() => goNext("extra", "done")}
          onBack={() => setStep("evening")}
        />
      )}

      {step === "done" && (
        <div className="pt-24 text-center">
          <i className="ph ph-check-circle mb-4 text-5xl text-primary"></i>
          <p className="mb-2 text-lg font-bold text-black">입력이 완료됐어요</p>
          <p className="text-sm text-ink-faint">
            성분 분석 결과 화면은 다음 단계에서 만들 예정이에요.
          </p>
        </div>
      )}
    </div>
  );
}
