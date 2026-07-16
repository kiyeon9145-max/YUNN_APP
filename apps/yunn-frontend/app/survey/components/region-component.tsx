"use client";

// region-component.tsx — Step 2: 거주 도시 입력
//
// 인도는 지역마다 기후(습도·자외선·건조도)가 크게 달라 루틴 추천에 반영해야 한다.
// 주요 5개 도시는 라디오 버튼(선택 즉시 자동으로 다음 스텝), Other만 체크박스 스타일로 두고
// 선택 시 직접 입력 필드를 펼친다 — 목록에 없는 도시라도 진단이 막히지 않게.

import { useEffect, useRef, useState } from "react";
import { SurveyActions, SurveyChoiceButton, ValidCheck } from "./button-component";
import { STEP2_CITY_OPTIONS } from "../step-data";

const OTHER_VALUE = "Other";

interface RegionStepProps {
  onNext: (answers: { city: string }) => void;
  onBack: () => void;
}

export default function RegionStep({ onNext, onBack }: RegionStepProps) {
  const [selection, setSelection] = useState<string | null>(null);
  const [customCity, setCustomCity] = useState("");

  const isOther = selection === OTHER_VALUE;
  const finalCity = isOther ? customCity.trim() : selection;
  const isComplete = isOther ? customCity.trim().length >= 2 : selection !== null;

  // onNext 최신 참조 — 자동 진행 타이머 클로저가 stale 값을 잡지 않도록
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  });

  // 5개 도시 중 하나를 고르면 300ms 뒤 자동으로 다음 스텝 (Step 1 gender/age와 동일한 패턴).
  // Other는 직접 입력이 필요하므로 자동 진행하지 않고 Next 버튼으로만 넘어간다.
  useEffect(() => {
    if (!selection || isOther) return;
    const id = setTimeout(() => onNextRef.current({ city: selection }), 300);
    return () => clearTimeout(id);
  }, [selection, isOther]);

  const handleNext = () => {
    if (!isComplete || !finalCity) return;
    onNext({ city: finalCity });
  };

  return (
    <>
      <h2 className="text-[24px] font-bold leading-[1.12] tracking-[-0.01em] text-black mb-[10px]">
        Tell us where you&apos;re <span className="text-primary">based.</span>
      </h2>
      <p className="text-[12px] font-normal leading-[1.45] tracking-[0.6px] text-black mb-[35px]">
        Your city shapes what your skin actually needs.
      </p>

      <h3 className="text-[15px] font-bold leading-[1.2] text-black mb-5">
        Which city do you live in?
      </h3>
      <div className="flex flex-col gap-4">
        {STEP2_CITY_OPTIONS.map((city) => (
          <SurveyChoiceButton
            key={city}
            role="radio"
            selected={selection === city}
            onClick={() => setSelection(city)}
          >
            {city}
          </SurveyChoiceButton>
        ))}
        <SurveyChoiceButton
          role="checkbox"
          selected={isOther}
          onClick={() => setSelection(isOther ? null : OTHER_VALUE)}
        >
          {OTHER_VALUE}
        </SurveyChoiceButton>

        {isOther && (
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Enter your city"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              className="w-full h-11 border border-[#EBEBEB] rounded-[5px] bg-white px-4 pr-[40px] text-sm font-normal tracking-[0.4px] outline-none text-black placeholder:text-[#9D9BA0] focus:border-primary transition-colors"
            />
            {customCity.trim().length >= 2 && <ValidCheck />}
          </div>
        )}
      </div>

      <SurveyActions
        className="mt-[38px]"
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={!isComplete}
      />
    </>
  );
}
