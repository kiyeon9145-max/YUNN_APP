"use client";

// WhatsAppCompleteScreen.tsx — 설문 완료 안내 화면 (구글폼 대체 설문의 마지막 스텝)
//
// 결과를 왓츠앱으로 받도록 안내하는 화면. AnalysisScreen/ResultScreen과 마찬가지로
// SurveyShell 밖에서 화면 전체를 직접 그린다(자체 헤더 + 스텝 트래커를 가짐).
// stepLabels/features/instructions 등 텍스트·목록만 바꾸면 다른 설문에도 재사용할 수 있다.

export interface CompleteFeature {
  icon: string; // phosphor 아이콘 클래스, e.g. "ph ph-user"
  label: string;
}

export interface CompleteInstruction {
  step: number;
  text: string;
}

interface WhatsAppCompleteScreenProps {
  stepLabels: string[]; // e.g. ["Personal", "Skin", "Lifestyle", "Goals", "Finish"]
  title: string;
  description: string;
  reportIncludesTitle: string;
  features: CompleteFeature[];
  ctaHint: string;
  ctaLabel: string;
  whatsappPhoneNumber: string; // 국가코드 포함, 특수문자 없이 (e.g. "911234567890")
  whatsappMessage: string;
  instructions: CompleteInstruction[];
  privacyNote?: string;
}

export default function WhatsAppCompleteScreen({
  stepLabels,
  title,
  description,
  reportIncludesTitle,
  features,
  ctaHint,
  ctaLabel,
  whatsappPhoneNumber,
  whatsappMessage,
  instructions,
  privacyNote = "We will never share your personal information.",
}: WhatsAppCompleteScreenProps) {
  const whatsappHref = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  return (
    <div className="mx-auto min-h-screen max-w-phone-max bg-white px-shell-x pt-8 pb-10">
      {/* ── 스텝 트래커 ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center mb-8">
        {stepLabels.map((label, index) => {
          const isLast = index === stepLabels.length - 1;
          return (
            <div
              key={label}
              className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    "text-white text-[10px] font-bold",
                    isLast ? "bg-ink-muted" : "bg-primary",
                  ].join(" ")}
                >
                  {isLast ? (
                    index + 1
                  ) : (
                    <i className="ph-bold ph-check text-[10px]"></i>
                  )}
                </div>
                <span
                  className={[
                    "text-[9px] whitespace-nowrap",
                    isLast ? "text-black font-semibold" : "text-ink-muted",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-[2px] bg-primary mx-1 mb-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── 완료 카드 ──────────────────────────────────────────── */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-5">
          <i className="ph-bold ph-check text-3xl"></i>
        </div>

        <h2 className="text-[20px] font-bold text-black leading-[1.2] mb-3">
          {title}
        </h2>
        <p className="text-[13px] text-ink-faint leading-[1.5] mb-6">
          {description}
        </p>

        <div className="rounded-card bg-primary-light px-4 py-5 mb-6">
          <p className="text-[13px] font-bold text-primary mb-4">
            {reportIncludesTitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center gap-2 w-[76px]"
              >
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary text-lg">
                  <i className={feature.icon}></i>
                </div>
                <span className="text-[10px] text-black leading-[1.3]">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[13px] text-black mb-4">{ctaHint}</p>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-btn bg-primary text-white text-[15px] font-semibold px-6 py-3 no-underline"
        >
          <i className="ph-fill ph-whatsapp-logo text-xl"></i>
          {ctaLabel}
          <i className="ph ph-arrow-right"></i>
        </a>

        <div className="flex flex-col gap-3 mt-6 text-left">
          {instructions.map((instruction) => (
            <div key={instruction.step} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-[11px] font-bold flex items-center justify-center">
                {instruction.step}
              </span>
              <span className="text-[12px] text-ink-faint leading-[1.4]">
                {instruction.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3 text-[10px] text-[#777] leading-[1.2]">
        <i className="ph-fill ph-lock-key text-[16px] text-[#9D9BA0]"></i>
        <span>{privacyNote}</span>
      </div>
    </div>
  );
}
