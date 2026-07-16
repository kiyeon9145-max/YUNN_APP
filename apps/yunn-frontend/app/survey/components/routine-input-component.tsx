"use client";

// routine-input-component.tsx — 아침/저녁/추가 루틴 제품 입력 화면
//
// 사용자가 이미 쓰고 있는 화장품을 카테고리별로 입력하는 화면 (성분 미스매치
// 분석 기능의 입력 단계). Figma Lo-Fi 설계 대신, 제거 가능한 칩 + 드롭다운
// 즉시추가 + Back/Next 2버튼 방향의 목업을 따른다.
//
// 컨트롤드 컴포넌트: 제품 목록(ProductEntry[])의 source of truth는 부모가
// 가진다. 이 컴포넌트는 touched/submitted/드롭다운 open 같은 순수 UI 상태만
// 갖고, 행 추가/삭제/이름 변경은 즉시 onChange로 부모에 올린다.

import { useEffect, useRef, useState } from "react";
import { SurveyActions, ValidCheck } from "./button-component";

export interface ProductEntry {
  category: string;
  name: string;
}

export type RoutinePeriod = "morning" | "evening" | "additional";

interface RoutineInputStepProps {
  period: RoutinePeriod;
  value: ProductEntry[];
  onChange: (value: ProductEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
  stepIndex?: number;
  totalDots?: number;
}

const CATEGORIES = [
  "클렌저",
  "토너",
  "세럼",
  "모이스처라이저",
  "선크림",
  "기타",
] as const;

const PERIOD_LABEL: Record<RoutinePeriod, string> = {
  morning: "아침 루틴",
  evening: "저녁 루틴",
  additional: "추가 루틴",
};

const PERIOD_TITLE: Record<RoutinePeriod, string> = {
  morning: "아침에 사용하는\n제품을 알려주세요",
  evening: "저녁에 사용하는\n제품을 알려주세요",
  additional: "추가로 사용하는\n제품이 있나요?",
};

const PERIOD_STEP_INDEX: Record<RoutinePeriod, number> = {
  morning: 1,
  evening: 2,
  additional: 3,
};

const SUBTITLE = "카테고리를 선택하고 제품명을 적어주세요";

export default function RoutineInputStep({
  period,
  value,
  onChange,
  onNext,
  onBack,
  stepIndex,
  totalDots = 3,
}: RoutineInputStepProps) {
  const [touched, setTouched] = useState<boolean[]>(() =>
    value.map(() => false),
  );
  const [submitted, setSubmitted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prevLength = useRef(value.length);

  // 드롭다운으로 새 행이 추가된 직후에만 그 입력창에 자동 포커스
  useEffect(() => {
    if (value.length > prevLength.current) {
      inputRefs.current[value.length - 1]?.focus();
    }
    prevLength.current = value.length;
  }, [value.length]);

  const handleSelectCategory = (category: string) => {
    onChange([...value, { category, name: "" }]);
    setTouched((prev) => [...prev, false]);
  };

  const handleNameChange = (index: number, name: string) => {
    onChange(
      value.map((entry, i) => (i === index ? { ...entry, name } : entry)),
    );
  };

  const handleBlur = (index: number) => {
    setTouched((prev) => prev.map((t, i) => (i === index ? true : t)));
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setTouched((prev) => prev.filter((_, i) => i !== index));
  };

  // input-component.tsx Step1과 동일한 규칙: blur 또는 Next 클릭 이전엔 노출 안 함
  const isRowInvalid = (index: number) =>
    value[index].name.trim() === "" && (touched[index] || submitted);

  const hasIncompleteRow = value.some((row) => row.name.trim() === "");
  // 추가 루틴은 선택 사항이라 제품을 하나도 안 넣어도 Next로 바로 넘어갈 수 있다.
  // 아침/저녁은 최소 1개 입력이 필수.
  const requiresAtLeastOne = period !== "additional";
  const nextDisabled =
    (requiresAtLeastOne && value.length === 0) || hasIncompleteRow;

  const handleNext = () => {
    if (nextDisabled) {
      setSubmitted(true);
      return;
    }
    onNext();
  };

  const filledDots = stepIndex ?? PERIOD_STEP_INDEX[period];

  return (
    <>
      {/* ── 헤더: 뒤로가기 + 점 스테퍼 + period 라벨 ─────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex h-8 w-8 cursor-pointer items-center justify-center text-ink"
        >
          <i className="ph ph-arrow-left text-xl"></i>
        </button>
        <div className="flex items-center gap-[6px]">
          {Array.from({ length: totalDots }).map((_, i) => (
            <span
              key={i}
              className={[
                "h-[6px] w-[6px] rounded-full transition-colors",
                i < filledDots ? "bg-primary" : "bg-line",
              ].join(" ")}
            />
          ))}
        </div>
        <span className="text-xs font-semibold tracking-[0.4px] text-ink-faint">
          {PERIOD_LABEL[period]}
        </span>
      </div>

      {/* ── 제목 + 부제 ──────────────────────────────────────────────── */}
      <h2 className="mb-2 whitespace-pre-line text-[24px] font-bold leading-[1.25] tracking-[-0.01em] text-black">
        {PERIOD_TITLE[period]}
      </h2>
      <p className="mb-7 text-[13px] font-normal leading-[1.45] text-ink-faint">
        {SUBTITLE}
      </p>

      {/* ── 추가된 제품 행 목록 ──────────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-5">
        {value.map((row, index) => (
          <div key={index}>
            <div className="mb-2">
              <RoutineTag
                label={row.category}
                onRemove={() => handleRemove(index)}
              />
            </div>
            <div className="relative">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                placeholder="제품명을 입력하세요"
                value={row.name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                onBlur={() => handleBlur(index)}
                className={[
                  inputClass,
                  isRowInvalid(index) ? "!border-[#E5534B]" : "",
                ].join(" ")}
              />
              {row.name.trim() !== "" && <ValidCheck />}
            </div>
            {isRowInvalid(index) && (
              <p className="mt-[7px] flex items-center gap-1 text-[11px] leading-[1.25] tracking-[0.2px] text-[#E5534B]">
                <i className="ph ph-warning-circle text-[12px]"></i>
                제품명을 입력해주세요
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── 카테고리 선택 드롭다운 (선택 즉시 새 행 추가) ──────────────── */}
      <CategorySelect onSelect={handleSelectCategory} />

      {/* ── Back / Next ──────────────────────────────────────────────── */}
      <SurveyActions
        className="mt-[30px]"
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={nextDisabled}
      />
    </>
  );
}

// ── 공통 인라인 컴포넌트 ────────────────────────────────────────────────────

function RoutineTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary-light px-4 py-[6px] text-sm font-semibold text-primary">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${label} 삭제`}
        className="flex cursor-pointer items-center justify-center text-primary"
      >
        <i className="ph-bold ph-x text-xs"></i>
      </button>
    </div>
  );
}

function CategorySelect({
  onSelect,
}: {
  onSelect: (category: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center justify-between rounded-[5px] border border-[#EBEBEB] bg-white px-4 text-sm text-ink-faint transition-colors"
      >
        <span>화장품 종류 선택</span>
        <i
          className={`ph ph-caret-down text-[14px] transition-transform ${open ? "rotate-180" : ""}`}
        ></i>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-[5px] border border-[#EBEBEB] bg-white shadow-[0_4px_7px_rgba(0,0,0,0.08)]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelect(cat);
                setOpen(false);
              }}
              className="block w-full cursor-pointer px-4 py-3 text-left text-sm text-black transition-colors hover:bg-primary-light"
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// input-component.tsx의 inputClass와 동일한 레시피 (새 보더/라운드 값 발명 금지)
const inputClass = [
  "w-full h-9 border border-[#EBEBEB] rounded-[5px] bg-white",
  "px-4 pr-[40px] text-xs font-normal tracking-[0.6px] outline-none text-black",
  "placeholder:text-[#9D9BA0]",
  "focus:border-primary transition-colors",
].join(" ");
