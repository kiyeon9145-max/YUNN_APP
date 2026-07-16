"use client";

// button-component.tsx — 설문 화면 공통 버튼 컴포넌트
//
// Back/Next 액션 버튼과 인트로 CTA처럼 설문 흐름에서 반복되는 버튼은 이 파일에서만
// 스타일을 정의한다. 각 화면은 버튼을 직접 만들지 않고 이 컴포넌트를 가져다 쓴다.

interface SurveyButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
  className?: string;
}

interface ResultCtaButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

interface SurveyActionsProps {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  className?: string;
}

interface PhotoStepActionsProps {
  onBack: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

interface PhotoUploadButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  hasPreview?: boolean;
}

interface SurveyChoiceButtonProps {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  role?: "radio" | "checkbox";
}

interface SurveyImageChoiceButtonProps {
  title: string;
  description: string;
  image: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

interface SurveyNotSureButtonProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export function SurveyButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
}: SurveyButtonProps) {
  const variantClass =
    variant === "outline"
      ? "border border-[#5CC1A6] text-primary bg-white active:bg-primary/5"
      : "border border-transparent bg-[#5CC1A6] text-white disabled:bg-[#CFCFCF]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-[150px] h-[40px] rounded-[12px]",
        "text-base font-semibold tracking-[0.8px]",
        "cursor-pointer transition-colors disabled:cursor-not-allowed",
        variantClass,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// 결과 화면의 14일 루틴 CTA 스타일을 한 곳에서 관리하기 위한 전용 버튼이다.
export function ResultCtaButton({ children, onClick }: ResultCtaButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-[46px] rounded-[5px] bg-primary text-white text-[20px] font-bold flex items-center justify-center gap-2 cursor-pointer border-0"
    >
      {children}
    </button>
  );
}

export function SurveyActions({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Next",
  className = "",
}: SurveyActionsProps) {
  return (
    <div
      className={[
        "h-[69px] flex justify-center items-center gap-[25px]",
        className,
      ].join(" ")}
    >
      <SurveyButton variant="outline" onClick={onBack}>
        Back
      </SurveyButton>
      <SurveyButton onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </SurveyButton>
    </div>
  );
}

export function StartSurveyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center rounded-btn border-0 bg-primary text-xl font-medium text-white cursor-pointer transition-transform active:scale-[0.98]"
    >
      Start My Skin Analysis
      <i className="ph ph-arrow-right ml-2 text-xl"></i>
    </button>
  );
}

export function PhotoStepActions({
  onBack,
  onComplete,
  onSkip,
}: PhotoStepActionsProps) {
  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="h-[54px] flex-[0.8] rounded-[12px] border border-[#5CC1A6] bg-white px-0 text-base font-semibold tracking-[0.3px] text-primary cursor-pointer transition-colors active:bg-primary/5"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="h-[54px] flex-[1.2] rounded-[12px] border border-transparent bg-[#5CC1A6] px-0 text-base font-semibold tracking-[0.3px] text-white cursor-pointer transition-colors active:bg-primary-dark"
        >
          Complete Analysis
        </button>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="flex h-[54px] w-full items-center justify-center rounded-[12px] border border-[#EBEBEB] bg-white text-[15px] font-medium text-black cursor-pointer transition-colors active:bg-[#F8F9FA]"
      >
        Skip for now
      </button>
    </div>
  );
}

export function PhotoUploadButton({
  children,
  onClick,
  hasPreview = false,
}: PhotoUploadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex min-h-[184px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden",
        "rounded-lg border-[1.5px] border-dashed border-primary bg-white text-center transition-colors active:bg-[#F5FAF9]",
        hasPreview ? "px-0 py-0" : "px-5 py-10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function SurveyChoiceButton({
  children,
  selected,
  onClick,
  role = "radio",
}: SurveyChoiceButtonProps) {
  const isCheckbox = role === "checkbox";

  return (
    <div
      role={role}
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) =>
        (event.key === "Enter" || event.key === " ") && onClick()
      }
      className={[
        "min-h-[92px] rounded-[14px] px-6 py-5",
        "flex items-center gap-4",
        "cursor-pointer select-none transition-all duration-200 active:scale-[0.98]",
        selected
          ? "border-2 border-primary bg-[#F5FAF9] shadow-none"
          : "border-2 border-white bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
      ].join(" ")}
    >
      <span className="text-[1.05rem] font-bold">{children}</span>
      <div
        className={[
          "ml-auto w-6 h-6 border-2 flex items-center justify-center",
          "flex-shrink-0 transition-all duration-200",
          isCheckbox ? "rounded-[6px]" : "rounded-full",
          selected
            ? "bg-primary border-primary text-white"
            : "border-line text-transparent",
        ].join(" ")}
      >
        {selected && <i className="ph-bold ph-check text-[10px]"></i>}
      </div>
    </div>
  );
}

export function SurveyImageChoiceButton({
  title,
  description,
  image,
  selected,
  onClick,
}: SurveyImageChoiceButtonProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) =>
        (event.key === "Enter" || event.key === " ") && onClick()
      }
      className={[
        "relative flex flex-col items-stretch gap-0 overflow-hidden bg-white text-center",
        "cursor-pointer select-none transition-all duration-200 active:scale-[0.98]",
        "rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
        selected ? "border-2 border-primary" : "border border-line",
      ].join(" ")}
    >
      {image}
      <div className="min-h-[104px] bg-white px-2 pt-[13px] pb-4 flex flex-col items-center transition-colors">
        <div className="mb-2 flex min-h-[38px] items-center justify-center text-base font-bold leading-[1.2] text-black">
          {title}
        </div>
        <div className="flex min-h-[50px] items-start justify-center text-xs font-normal leading-[1.4] text-[#777]">
          {description}
        </div>
      </div>
      <div
        className={[
          "absolute top-2 right-2 flex items-center justify-center transition-all duration-200 z-[2]",
          "w-7 h-7 rounded-full border-2 shadow-[0_1px_4px_rgba(0,0,0,0.12)]",
          selected
            ? "bg-primary border-primary text-white"
            : "bg-white border-line text-transparent",
        ].join(" ")}
      >
        {selected && <i className="ph-bold ph-check text-[12px]"></i>}
      </div>
    </div>
  );
}

export function SurveyNotSureButton({
  title,
  description,
  selected,
  onClick,
}: SurveyNotSureButtonProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) =>
        (event.key === "Enter" || event.key === " ") && onClick()
      }
      className={[
        "mt-3 flex items-center gap-[14px] rounded-[12px] px-4 py-[14px]",
        "cursor-pointer select-none transition-all duration-200 active:scale-[0.98]",
        selected
          ? "border-2 border-primary bg-[#F5FAF9]"
          : "border border-line bg-white",
      ].join(" ")}
    >
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-ink-muted text-sm text-ink-muted">
        <i className="ph ph-question"></i>
      </div>
      <div className="flex-grow text-left">
        <div className="text-base font-bold leading-[1.2] text-black">
          {title}
        </div>
        <div className="text-xs leading-[1.35] text-ink-muted">
          {description}
        </div>
      </div>
      <i className="ph-bold ph-caret-right text-base text-black"></i>
    </div>
  );
}

// survey.css .step-valid-check: absolute right 13px, top 50%, color #3AAE92, font-size 18px
// 텍스트 입력 필드 옆에 붙는 "입력 완료" 체크 아이콘 — input-component.tsx, region-component.tsx 등에서 공용으로 쓴다.
export function ValidCheck() {
  return (
    <i className="ph-fill ph-check-circle absolute right-[13px] top-1/2 -translate-y-1/2 text-primary text-[18px] pointer-events-none"></i>
  );
}
