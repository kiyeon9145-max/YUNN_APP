"use client";

// survey-component.tsx — 옵션 카드 선택형 설문 스텝 공용 컴포넌트
//
// Step 2, 3, 4, 5, 6, 9 등 "카드 클릭으로 답변" 패턴을 모두 이 파일로 처리한다.
// 제목·그룹 목록·액션 버튼을 props로 받아 렌더링하므로 새 스텝 추가 시 파일을 만들 필요가 없다.
//
// 구조
//   SurveyChoiceButton  — 개별 선택 카드 버튼 (button-component.tsx)
//   SurveyOptionStep    — 제목 + 그룹 목록 + 액션 버튼 통합 (default export)
//
// 동작 근거 (SurveyScreen.js autoAdvanceSteps):
//   autoAdvance 기본값 → 모든 그룹이 radio면 선택 완료 후 300ms 뒤 onNext 호출
//   autoAdvance=false → 체크박스처럼 Next 확정이 필요한 화면에서 사용
//   radio  → 같은 그룹 내 단일 선택 (기본값)
//   checkbox → 복수 선택 가능 (Step 5 triggers 등)
//
// 스타일 근거 (survey.css .option-card, .step-two-*):
//   카드:         min-h 92px, rounded-[14px], px 24px, py 20px, gap 16px
//   선택 전:      border-2 #fff, shadow-[0_2px_12px_rgba(0,0,0,0.04)]
//   선택 후:      border-2 border-primary, bg-[#F5FAF9], shadow-none
//   체크 원:      w 24px, h 24px, rounded-full, border-2 border-line → selected: bg-primary
//   그룹 간격:    mb-[42px] (마지막 제외)
//   질문:         text-[15px] font-bold leading-[1.2] mb-5
//   액션:         h-[69px] mt-[38px] gap-[25px], buttons 150×40 rounded-[12px]

import { useState, useEffect, useRef } from "react";
import { SurveyActions, SurveyChoiceButton } from "./button-component";

// ── Types ───────────────────────────────────────────────────────────────────

export interface OptionItem {
  value: string;
  label: React.ReactNode; // 일반 텍스트 또는 JSX (T존 설명 등 rich text 대응)
}

export interface OptionGroup {
  name: string; // input name (e.g. 'gender', 'age', 'concerns')
  question?: string; // 그룹 제목. helper step처럼 화면 title만 쓰는 경우 생략 가능
  options: OptionItem[];
  type?: "radio" | "checkbox"; // 기본 'radio'
}

interface SurveyOptionStepProps {
  title: React.ReactNode; // JSX 지원 — <span className="text-primary"> 등
  subtitle?: string;
  groups: OptionGroup[];
  autoAdvance?: boolean; // 생략 시 radio-only 화면은 자동 진행, checkbox 화면은 수동 진행
  requiredMessage?: string; // 미선택 상태에서 Next 클릭 시 alert 문구
  showSecure?: boolean; // 하단 "Your information is private and secure" 표시 여부
  onNext: (answers: Record<string, string | string[]>) => void;
  onBack: () => void;
}

// ── SurveyOptionStep ────────────────────────────────────────────────────────

export default function SurveyOptionStep({
  title,
  subtitle,
  groups,
  autoAdvance,
  requiredMessage = "Please make a selection.",
  showSecure = false,
  onNext,
  onBack,
}: SurveyOptionStepProps) {
  const [selections, setSelections] = useState<
    Record<string, string | string[]>
  >({});
  const shouldAutoAdvance =
    autoAdvance ?? groups.every((group) => (group.type ?? "radio") === "radio");

  // onNext·selections 최신 참조 — autoAdvance 타이머 클로저가 stale 값을 잡지 않도록
  const onNextRef = useRef(onNext);
  const selectionsRef = useRef(selections);
  useEffect(() => {
    onNextRef.current = onNext;
  });
  useEffect(() => {
    selectionsRef.current = selections;
  }, [selections]);

  // 모든 그룹에 선택이 있을 때 완료
  const isComplete = groups.every((g) => {
    const sel = selections[g.name];
    if (sel === undefined) return false;
    return Array.isArray(sel) ? sel.length > 0 : true;
  });

  // autoAdvance: 완료 순간 300ms 타이머 시작, 언마운트·재선택 시 취소 후 재시작
  useEffect(() => {
    if (!shouldAutoAdvance || !isComplete) return;
    const id = setTimeout(() => onNextRef.current(selectionsRef.current), 300);
    return () => clearTimeout(id);
  }, [shouldAutoAdvance, isComplete]);

  const handleRadio = (groupName: string, value: string) =>
    setSelections((prev) => ({ ...prev, [groupName]: value }));

  const handleCheckbox = (groupName: string, value: string) =>
    setSelections((prev) => {
      const current = (prev[groupName] as string[] | undefined) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [groupName]: next };
    });

  const handleNext = () => {
    if (!isComplete) {
      alert(requiredMessage);
      return;
    }
    onNext(selections);
  };

  return (
    <>
      {/* ── 제목 ─────────────────────────────────────────────────
          survey.css: font-size 24px, font-weight 700, leading 1.12,
          tracking -0.01em, mb 10px
          ──────────────────────────────────────────────────────── */}
      <h2 className="text-[24px] font-bold leading-[1.12] tracking-[-0.01em] text-black mb-[10px]">
        {title}
      </h2>

      {/* ── 소제목 ───────────────────────────────────────────────
          font-size 12px, tracking 0.6px, mb 35px
          ──────────────────────────────────────────────────────── */}
      {subtitle && (
        <p className="text-[12px] font-normal leading-[1.45] tracking-[0.6px] text-black mb-[35px]">
          {subtitle}
        </p>
      )}

      {/* ── 그룹 목록 ─────────────────────────────────────────── */}
      {groups.map((group, i) => {
        const type = group.type ?? "radio";
        const isLast = i === groups.length - 1;
        return (
          <div key={group.name} className={isLast ? "" : "mb-[42px]"}>
            {group.question && (
              <h3 className="text-[15px] font-bold leading-[1.2] text-black mb-5">
                {group.question}
              </h3>
            )}
            <div className="flex flex-col gap-4">
              {group.options.map((opt) => {
                const isSelected =
                  type === "checkbox"
                    ? (
                        (selections[group.name] as string[] | undefined) ?? []
                      ).includes(opt.value)
                    : selections[group.name] === opt.value;
                return (
                  <SurveyChoiceButton
                    key={opt.value}
                    selected={isSelected}
                    role={type}
                    onClick={() =>
                      type === "checkbox"
                        ? handleCheckbox(group.name, opt.value)
                        : handleRadio(group.name, opt.value)
                    }
                  >
                    {opt.label}
                  </SurveyChoiceButton>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── 액션 버튼 ────────────────────────────────────────────
          h-[69px], mt-[38px], gap-[25px]
          두 버튼: w-[150px] h-[40px] rounded-[12px] text-base font-semibold tracking-[0.8px]
          ──────────────────────────────────────────────────────── */}
      <SurveyActions
        className="mt-[38px]"
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={!isComplete}
      />

      {/* ── 보안 텍스트 (선택적 표시) ────────────────────────────
          survey.css: mt 28px, font-size 10px, color #777, icon color #9D9BA0, gap 12px
          ──────────────────────────────────────────────────────── */}
      {showSecure && (
        <div className="mt-[28px] flex items-center justify-center gap-3 text-[10px] text-[#777] leading-[1.2]">
          <i className="ph-fill ph-lock-key text-[16px] text-[#9D9BA0]"></i>
          <span>Your information is private and secure</span>
        </div>
      )}
    </>
  );
}
