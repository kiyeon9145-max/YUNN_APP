"use client";

// scale-question-component.tsx — 0~N 척도(NPS 스타일) 선택형 설문 스텝
//
// "이 플랜이 얼마나 유용했나요?" 같은 만족도/평점 질문에 재사용한다.
// survey-component.tsx(SurveyOptionStep)와 같은 API 형태(title/subtitle/onNext/onBack)를
// 따르되, 카드 목록 대신 원형 버튼 척도를 렌더링한다.
//
// 스타일 근거 (survey-component.tsx, button-component.tsx의 색상 토큰 재사용):
//   선택 버튼:   w/h 28px, rounded-full, border-2
//   선택 전:     border-line, bg-white, text-ink
//   선택 후:     border-primary, bg-primary, text-white
//   양끝 라벨:   text-[11px], text-ink-muted, justify-between

import { useState } from "react";
import { SurveyActions } from "./button-component";

interface ScaleQuestionStepProps {
  title: React.ReactNode;
  subtitle?: string;
  scaleMax?: number; // 기본 0~10
  minLabel: string;
  maxLabel: string;
  requiredMessage?: string;
  showSecure?: boolean;
  onNext: (value: string) => void;
  onBack: () => void;
}

export default function ScaleQuestionStep({
  title,
  subtitle,
  scaleMax = 10,
  minLabel,
  maxLabel,
  requiredMessage = "Please select a rating.",
  showSecure = false,
  onNext,
  onBack,
}: ScaleQuestionStepProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const values = Array.from({ length: scaleMax + 1 }, (_, i) => i);

  const handleNext = () => {
    if (selected === null) {
      alert(requiredMessage);
      return;
    }
    onNext(String(selected));
  };

  return (
    <>
      <h2 className="text-[20px] font-normal leading-[1.4] tracking-normal text-black mb-[10px]">
        {title}
      </h2>

      {subtitle && (
        <p className="text-[12px] font-normal leading-[1.45] tracking-[0.6px] text-black mb-[35px]">
          {subtitle}
        </p>
      )}

      <div className="flex justify-between gap-1">
        {values.map((n) => {
          const isSelected = selected === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(n)}
              className={[
                "w-7 h-7 rounded-full border-2 flex-shrink-0",
                "flex items-center justify-center text-[11px] font-semibold",
                "cursor-pointer transition-colors duration-150",
                isSelected
                  ? "border-[#5CC1A6] bg-[#5CC1A6] text-white"
                  : "border-[#5CC1A6] bg-white text-[#5CC1A6]",
              ].join(" ")}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-[10px] text-[11px] text-black">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      <SurveyActions
        className="mt-[38px]"
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={selected === null}
      />

      {showSecure && (
        <div className="mt-[28px] flex items-center justify-center gap-3 text-[10px] text-[#777] leading-[1.2]">
          <i className="ph-fill ph-lock-key text-[16px] text-[#9D9BA0]"></i>
          <span>Your information is private and secure</span>
        </div>
      )}
    </>
  );
}
