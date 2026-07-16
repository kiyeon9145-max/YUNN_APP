"use client";

// image-survey-component.tsx — 이미지 카드형 설문 공용 컴포넌트
//
// Step 3(피부 타입)과 Step 4(피부 고민)처럼 2열 이미지 카드로 답변을 고르는
// 페이지에서 사용한다. 일반 텍스트 옵션은 survey-component.tsx가 담당한다.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  SurveyActions,
  SurveyImageChoiceButton,
  SurveyNotSureButton,
} from "./button-component";

export interface ImageOptionItem {
  value: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  variant?: "image" | "not-sure";
}

interface ImageSurveyStepProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  question?: React.ReactNode;
  helperText?: React.ReactNode;
  options: ImageOptionItem[];
  requiredMessage?: string;
  showSecure?: boolean;
  autoAdvance?: boolean;
  onNext: (value: string) => void;
  onBack: () => void;
}

export default function ImageSurveyStep({
  title,
  subtitle,
  question,
  helperText,
  options,
  requiredMessage = "Please make a selection.",
  showSecure = false,
  autoAdvance = true,
  onNext,
  onBack,
}: ImageSurveyStepProps) {
  const [selectedValue, setSelectedValue] = useState("");
  const onNextRef = useRef(onNext);
  const selectedValueRef = useRef(selectedValue);
  const imageOptions = options.filter(
    (option) => option.variant !== "not-sure",
  );
  const specialOptions = options.filter(
    (option) => option.variant === "not-sure",
  );
  const isComplete = selectedValue.length > 0;

  useEffect(() => {
    onNextRef.current = onNext;
  });
  useEffect(() => {
    selectedValueRef.current = selectedValue;
  }, [selectedValue]);

  useEffect(() => {
    if (!autoAdvance || !isComplete) return;
    const id = setTimeout(
      () => onNextRef.current(selectedValueRef.current),
      300,
    );
    return () => clearTimeout(id);
  }, [autoAdvance, isComplete]);

  const handleNext = () => {
    if (!isComplete) {
      alert(requiredMessage);
      return;
    }
    onNext(selectedValue);
  };

  return (
    <>
      <h2 className="text-[24px] font-bold leading-[1.12] tracking-[-0.01em] text-black mb-3">
        {title}
      </h2>

      {subtitle && (
        <p className="text-[12px] font-normal leading-[1.45] tracking-[0.6px] text-black mb-7">
          {subtitle}
        </p>
      )}

      {question && (
        <div className="text-base font-bold leading-[1.2] text-black mb-2">
          {question}
        </div>
      )}

      {helperText && (
        <div className="mb-4 flex items-center gap-1.5 text-xs leading-[1.35] text-black">
          <i className="ph ph-check-circle text-base text-primary"></i>
          <span>{helperText}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-[14px] gap-y-4">
        {imageOptions.map((option) => (
          <ImageOptionCard
            key={option.value}
            option={option}
            selected={selectedValue === option.value}
            onClick={() => setSelectedValue(option.value)}
          />
        ))}
      </div>

      {specialOptions.map((option) => (
        <NotSureCard
          key={option.value}
          option={option}
          selected={selectedValue === option.value}
          onClick={() => setSelectedValue(option.value)}
        />
      ))}

      <SurveyActions
        className="mt-[38px]"
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={!isComplete}
      />

      {showSecure && (
        <div className="mt-[28px] flex items-center justify-center gap-3 text-[10px] text-[#777] leading-[1.2]">
          <i className="ph-fill ph-lock-key text-[16px] text-[#9D9BA0]"></i>
          <span>YUNN keeps your information safe and secure.</span>
        </div>
      )}
    </>
  );
}

function ImageOptionCard({
  option,
  selected,
  onClick,
}: {
  option: ImageOptionItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <SurveyImageChoiceButton
      title={option.title}
      description={option.description}
      selected={selected}
      onClick={onClick}
      image={
        <Image
          src={option.imageSrc ?? ""}
          alt={option.imageAlt ?? option.title}
          width={180}
          height={128}
          className="block h-[128px] w-full object-cover"
        />
      }
    />
  );
}

function NotSureCard({
  option,
  selected,
  onClick,
}: {
  option: ImageOptionItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <SurveyNotSureButton
      title={option.title}
      description={option.description}
      selected={selected}
      onClick={onClick}
    />
  );
}
