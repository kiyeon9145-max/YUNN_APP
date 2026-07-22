"use client";

// text-question-component.tsx — 자유 서술형(주관식) 설문 스텝
//
// "왜 14일 플랜을 신청하셨나요?" 같은 개방형 피드백 질문에 재사용한다.
// survey-component.tsx(SurveyOptionStep)와 같은 API 형태(title/subtitle/onNext/onBack)를 따른다.
//
// 스타일 근거 (input-component.tsx의 인풋 레시피를 textarea에 맞게 재사용):
//   textarea: border border-line, rounded-card(8px), p-4, text-sm
//   focus:    border-primary
//   counter:  text-[11px], text-ink-muted, 우측 정렬

import { useState } from "react";
import { SurveyActions } from "./button-component";

interface TextQuestionStepProps {
  title: React.ReactNode;
  subtitle?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  requiredMessage?: string;
  showSecure?: boolean;
  onNext: (value: string) => void;
  onBack: () => void;
}

export default function TextQuestionStep({
  title,
  subtitle,
  placeholder = "Type your answer here...",
  maxLength = 1000,
  required = true,
  requiredMessage = "Please share your answer.",
  showSecure = false,
  onNext,
  onBack,
}: TextQuestionStepProps) {
  const [value, setValue] = useState("");

  const handleNext = () => {
    if (required && value.trim().length === 0) {
      alert(requiredMessage);
      return;
    }
    onNext(value.trim());
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

      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => setValue(e.target.value)}
        className={[
          "w-full min-h-[160px] rounded-card border border-line bg-white p-4",
          "text-sm text-black outline-none resize-none",
          "placeholder:text-ink-muted focus:border-primary transition-colors",
        ].join(" ")}
      />

      <div className="text-right text-[11px] text-ink-muted mt-[6px]">
        {value.length} / {maxLength}
      </div>

      <SurveyActions
        className="mt-[38px]"
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={required && value.trim().length === 0}
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
