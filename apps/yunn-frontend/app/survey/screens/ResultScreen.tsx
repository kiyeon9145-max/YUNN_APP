"use client";

// ResultScreen.tsx — 피부 진단 결과 화면
//
// 구성 섹션 (result.css 기준):
//   StatusBar      — 시간 + 신호 아이콘 목업 (42px)
//   TopBar         — 뒤로/제목/공유 (56px)
//   InsightSection — 피부타입명 + 얼굴 이미지 + 키워드 + 요약
//   InfoCard       — "Check your current skin balance" 안내
//   BalanceCard    — 6개 밸런스 게이지
//   RoutineSection — 아침/저녁 탭 + 루틴 스텝 카드
//   ProductsSection— 추천 상품 2열 그리드
//   BottomNav      — 하단 5탭 (고정)
//
// 잠금(피드백 게이트) 메커니즘은 MVP 이후 구현 예정 — 현재 모두 잠금 해제 상태로 표시.

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SurveyAnswers } from "../page";
import {
  RESULT_ASSETS,
  RESULT_PRODUCTS,
  computeSkinBalance,
  getResultConfig,
  toConcernKey,
  type BalanceMetric,
  type ResultConfig,
  type ResultData,
  type RoutineStep,
  type ProductItem,
} from "../result-data";
import { savePendingResult } from "@/app/routine/lib/routine-storage";
import { setAnalyticsContext, trackEvent } from "@/app/lib/analytics";
import { ResultCtaButton } from "../components/button-component";

interface ResultScreenProps {
  answers: SurveyAnswers;
  onRetake: () => void;
}

function toResultData(answers: SurveyAnswers): ResultData {
  return {
    name: answers.name || "Guest",
    gender: answers.gender || "Female",
    skinType: answers.skinType || "Oily",
    concernType: toConcernKey(answers.concerns || "Acne"),
    age: answers.age || "",
    sleep: answers.sleep || "",
    stress: answers.stress || "",
    sensitivity: answers.sensitivity || "",
    outdoor: answers.outdoor || "",
    sunscreen: answers.sunscreen || "",
  };
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function ResultScreen({ answers, onRetake }: ResultScreenProps) {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<"morning" | "evening">(
    "morning",
  );
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [going, setGoing] = useState(false);

  // 쿠키에서 A/B variant 읽기 (middleware에서 이미 설정됨)
  useEffect(() => {
    // document.cookie에서 ab_variant 값 파싱
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("ab_variant="))
      ?.split("=")[1];

    const abVariant = (cookieValue as "A" | "B" | undefined) || "A";
    setVariant(abVariant);
  }, []);

  const data = useMemo(() => toResultData(answers), [answers]);
  const config = useMemo(() => getResultConfig(data), [data]);
  const balance = useMemo(
    () => computeSkinBalance(data, config),
    [data, config],
  );

  // 결과 화면 노출을 피부 타입/고민별 전환 분석의 기준 이벤트로 남긴다.
  useEffect(() => {
    setAnalyticsContext({
      city: answers.city ?? null,
      skin_concern: data.concernType,
    });
    trackEvent("result_view", {
      skin_type: data.skinType,
      concern_type: data.concernType,
      gender: data.gender,
      age: data.age,
      variant: variant,
    });
  }, [answers.city, data, variant]);

  // 설문 결과를 localStorage에 저장해 /routine이 읽을 수 있게 한 뒤 이동
  // Lead 이벤트는 정확히 1회만 발화 (더블클릭 방지)
  const handleUnlockRoutine = useCallback(() => {
    // 더블클릭 방지
    if (going) return;
    setGoing(true);

    // 14일 루틴 CTA 클릭은 결과 확인 후 루틴 진입 의향을 보는 핵심 지표다.
    window.fbq?.('track', 'Lead');

    trackEvent("routine_cta_click", {
      source: "result_screen",
      skin_type: data.skinType,
      concern_type: data.concernType,
      variant: variant,
    });
    savePendingResult({
      skinType: data.skinType,
      concernType: data.concernType,
      gender: data.gender,
      name: data.name,
      email: answers.email || "",
      campaign: variant === "B" ? "coffee_coupon" : "routine",
    });

    // fbq 전송 여유를 위해 300ms 지연 후 이동
    setTimeout(() => {
      router.push("/routine/intro");
    }, 300);
  }, [data, answers.email, router, variant, going]);

  const faceImage =
    answers.photoDataUrl ||
    (answers.gender === "Male"
      ? RESULT_ASSETS.userFallbackMale
      : RESULT_ASSETS.userFallbackFemale);
  const isPhotoDataUrl = Boolean(answers.photoDataUrl);

  return (
    <div className="min-h-screen bg-white pb-[74px]">
      <div className="w-full max-w-[393px] mx-auto bg-white relative min-h-screen">
        <StatusBar />

        {/* 상단 바: 36px 아이콘 | 제목(중앙) | 36px 아이콘 */}
        <div className="h-[56px] px-[17px] grid grid-cols-[36px_1fr_36px] items-center">
          <button
            type="button"
            onClick={onRetake}
            className="w-9 h-9 flex items-center justify-center text-2xl text-black bg-transparent border-0 cursor-pointer"
            aria-label="Back"
          >
            <i className="ph ph-arrow-left"></i>
          </button>
          <h1 className="text-[15px] font-bold text-center text-black">
            AI Skin Analysis
          </h1>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center text-2xl text-black bg-transparent border-0 cursor-pointer"
            aria-label="Share"
          >
            <i className="ph ph-upload-simple"></i>
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="px-[17px] pt-[18px]">
          <InsightSection
            data={data}
            config={config}
            faceImage={faceImage}
            isPhotoDataUrl={isPhotoDataUrl}
          />
          <InfoCard />
          <BalanceCard balance={balance} />
          <RoutineSection
            config={config}
            activePeriod={activePeriod}
            onTabChange={setActivePeriod}
          />
          <ProductsSection onRetake={onRetake} onUnlockRoutine={handleUnlockRoutine} variant={variant} isLoading={going} />
        </div>

        <BottomNav onRetake={onRetake} />
      </div>
    </div>
  );
}

// ── StatusBar ───────────────────────────────────────────────────────────────

function StatusBar() {
  const time = useMemo(() => {
    const d = new Date();
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  }, []);

  return (
    <div className="h-[42px] px-[17px] pt-[14px] flex items-start justify-between text-[15px] font-bold leading-none text-black">
      <span>{time}</span>
      <div className="flex items-center gap-[7px] text-[18px]">
        <i className="ph-fill ph-cell-signal-full"></i>
        <span className="text-[12px] font-bold">4G</span>
        <i className="ph ph-battery-high"></i>
      </div>
    </div>
  );
}

// ── InsightSection ──────────────────────────────────────────────────────────

function InsightSection({
  data,
  config,
  faceImage,
  isPhotoDataUrl,
}: {
  data: ResultData;
  config: ResultConfig;
  faceImage: string;
  isPhotoDataUrl: boolean;
}) {
  return (
    <section className="relative min-h-[196px]">
      {/* 텍스트 영역 (왼쪽, 얼굴 이미지 제외 너비) */}
      <div className="pr-[143px]">
        <div className="text-[13px] font-bold text-primary mb-[6px]">
          YUNN Skin Insight
        </div>
        <div className="text-[20px] font-bold text-black leading-[1.35]">
          Hi! <span>{data.name}</span>
        </div>
        <div className="text-[20px] font-bold text-black leading-[1.35] mt-[13px]">
          Your skin type is
        </div>
        <div className="text-[32px] font-bold text-primary leading-[1.08] mt-[18px] break-keep w-[232px]">
          {config.skinTypeName}{" "}
          <span className="text-primary whitespace-nowrap">type</span>
        </div>
      </div>

      {/* 얼굴 이미지 — 절대 배치, 오른쪽 상단 */}
      <div className="absolute right-0 top-0 w-[127px] h-[174px] overflow-hidden bg-[#F6FBFA]">
        {isPhotoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faceImage}
            alt="Your skin photo"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <Image
            src={faceImage}
            alt="Skin analysis"
            width={127}
            height={174}
            className="w-full h-full object-cover object-top"
          />
        )}
      </div>

      {/* 키워드 태그 — 얼굴 이미지(absolute, 오른쪽)에 가려지지 않도록 텍스트 블록과 동일한 우측 여백을 준다 */}
      <div className="flex flex-wrap gap-2 mt-[14px] pr-[143px]">
        {config.keywords.map((kw) => (
          <span
            key={kw}
            className="min-h-[22px] px-[13px] rounded-full bg-[#E9F4F1] text-black text-[12px] font-bold leading-none inline-flex items-center justify-center whitespace-nowrap"
          >
            {kw}
          </span>
        ))}
      </div>

      {/* 요약 텍스트 — focus 키워드 bold + primary 강조 */}
      <div className="mt-[30px] text-center text-[17px] text-black leading-[1.78]">
        <SummaryText summary={config.summary} focus={config.focus} />
      </div>
    </section>
  );
}

// ── SummaryText ──────────────────────────────────────────────────────────────
// summary를 문장 단위로 분리하고, focus 키워드가 포함된 문장에서 해당 부분을
// bold + primary 색으로 강조한다.
// 동작 근거 (ResultService.js formatResultSummary):
//   /[^.!?]+[.!?]+|[^.!?]+$/g 로 문장 분리 → focus 포함 문장에 <strong> 삽입

function SummaryText({ summary, focus }: { summary: string; focus: string }) {
  const sentences: string[] = [];
  String(summary).replace(/[^.!?]+[.!?]+|[^.!?]+$/g, (match) => {
    const trimmed = match.trim();
    if (trimmed) sentences.push(trimmed);
    return match;
  });

  return (
    <>
      {sentences.map((sentence, i) => {
        const hasFocus = focus && sentence.includes(focus);
        return (
          <p key={i} className={i > 0 ? "mt-[18px]" : ""}>
            {hasFocus
              ? sentence.split(focus).map((part, j, arr) => (
                  <span key={j}>
                    {part}
                    {j < arr.length - 1 && (
                      <strong className="text-primary font-bold">
                        {focus}
                      </strong>
                    )}
                  </span>
                ))
              : sentence}
          </p>
        );
      })}
    </>
  );
}

// ── InfoCard ─────────────────────────────────────────────────────────────────

function InfoCard() {
  return (
    <section className="mt-[21px] min-h-[77px] rounded-[5px] bg-[#F7FCFB] border border-[#E5F2EF] shadow-[0_4px_10px_rgba(0,0,0,0.07)] flex items-center gap-[14px] px-4 py-[14px]">
      <div className="w-[38px] h-[38px] rounded-full bg-white text-primary flex items-center justify-center text-2xl flex-shrink-0">
        <i className="ph ph-lightbulb"></i>
      </div>
      <div>
        <div className="text-[15px] font-bold text-black leading-[1.2]">
          Check your current skin balance
        </div>
        <div className="text-[13px] text-black leading-[1.35] mt-[3px]">
          The areas with the lowest balance are the top priorities to improve.
        </div>
      </div>
    </section>
  );
}

// ── BalanceCard ──────────────────────────────────────────────────────────────

function BalanceCard({ balance }: { balance: BalanceMetric[] }) {
  return (
    <section className="mt-[28px] bg-white border border-[#E9E9E9] rounded-[5px] shadow-[0_4px_10px_rgba(0,0,0,0.12)] px-2 pt-[15px] pb-[14px]">
      {/* 헤더 */}
      <div className="flex items-baseline justify-between gap-[10px] px-[6px] mb-3">
        <div className="text-[20px] font-bold text-black leading-[1.2]">
          Your Skin Balance
        </div>
        <div className="text-primary text-[12px] leading-none whitespace-nowrap">
          • Good&nbsp;&nbsp;• Needs Care&nbsp;&nbsp;• Focus
        </div>
      </div>

      {balance.map((metric) => (
        <BalanceRow key={metric.key} metric={metric} />
      ))}

      <p className="text-[9px] text-[#A8A8A8] text-center mt-[15px]">
        ＊ Results are based on your answers and lifestyle data. Not a medical
        diagnosis.
      </p>
    </section>
  );
}

function BalanceRow({ metric }: { metric: BalanceMetric }) {
  return (
    <div className="grid grid-cols-[1fr_42px_78px] items-center gap-[9px] mt-[11px]">
      <span className="col-span-3 text-[11px] font-bold text-black leading-none">
        {metric.label}
      </span>
      <div className="h-[5px] rounded-full bg-[#D9D9D9] overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${metric.value}%` }}
        />
      </div>
      <span className="text-base font-bold text-black text-right leading-none">
        {metric.value}%
      </span>
      <div className="h-[18px] rounded-full bg-[#E9F4F1] text-primary text-[10px] font-semibold flex items-center justify-center">
        {metric.status}
      </div>
    </div>
  );
}

// ── RoutineSection ───────────────────────────────────────────────────────────

function RoutineSection({
  config,
  activePeriod,
  onTabChange,
}: {
  config: ResultConfig;
  activePeriod: "morning" | "evening";
  onTabChange: (period: "morning" | "evening") => void;
}) {
  const steps = config.routines[activePeriod];

  return (
    <section className="mt-[25px]">
      {/* 탭 */}
      <div className="grid grid-cols-2 gap-1 border border-[#E5E5E5] rounded-[5px] p-1 bg-white">
        <RoutineTab
          label="Morning Routine"
          subtitle="Protect & Glow"
          icon="ph-fill ph-sun"
          active={activePeriod === "morning"}
          onClick={() => onTabChange("morning")}
        />
        <RoutineTab
          label="Evening Routine"
          subtitle="Repair & Recover"
          icon="ph-fill ph-moon"
          active={activePeriod === "evening"}
          onClick={() => onTabChange("evening")}
        />
      </div>

      {/* 루틴 카드 목록 */}
      {steps.map((step, i) => (
        <RoutineCard key={step.name + i} step={step} index={i} />
      ))}
    </section>
  );
}

function RoutineTab({
  label,
  subtitle,
  icon,
  active,
  onClick,
}: {
  label: string;
  subtitle: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "border rounded-[4px] min-h-[58px] px-[10px] py-2 flex items-center justify-center gap-2 cursor-pointer transition-colors",
        active
          ? "border-primary text-primary bg-[#F8FDFB]"
          : "border-[#E5E5E5] text-black bg-white",
      ].join(" ")}
    >
      <i className={`${icon} text-2xl flex-shrink-0`}></i>
      <span className="flex flex-col items-start gap-[3px] min-w-0">
        <span className="text-[13px] font-bold leading-[1.1] text-left whitespace-nowrap">
          {label}
        </span>
        <span className="text-[11px] font-normal leading-[1.25] text-left text-[#8B8B8B]">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function RoutineCard({ step, index }: { step: RoutineStep; index: number }) {
  return (
    <article className="mt-[10px] bg-white border border-[#EAEAEA] rounded-[5px] shadow-[0_4px_10px_rgba(0,0,0,0.1)] px-2 pt-[10px] pb-[13px] grid grid-cols-[72px_1fr] gap-[9px]">
      {/* STEP 레이블 — 전체 너비 */}
      <div className="col-span-2 text-[11px] font-medium text-primary uppercase leading-none">
        STEP {index + 1}
      </div>

      {/* 상품 이미지 */}
      <div className="flex items-center justify-center w-[67px] min-h-[178px]">
        <Image
          src={step.imageSrc}
          alt={step.name}
          width={64}
          height={146}
          className="max-w-[64px] max-h-[146px] object-contain"
        />
      </div>

      {/* 상품 정보 */}
      <div>
        <div className="text-[16px] font-bold text-black leading-[1.16]">
          {step.name}
        </div>
        <div className="inline-flex items-center justify-center h-[16px] min-w-[49px] rounded-full bg-[#E9F4F1] text-primary text-[9px] font-bold my-[5px] px-2">
          {step.tag}
        </div>
        <div className="text-[11px] text-black leading-[1.45] mb-[7px]">
          {step.description}
        </div>

        <RoutineDetail
          icon="ph ph-question"
          title="Why it's recommended"
          copy={step.why}
        />
        <RoutineDetail
          icon="ph ph-drop"
          title="How to use"
          copy={step.how}
          isBorderTop
        />
        <RoutineDetail
          icon="ph ph-lightbulb"
          title="YUNN TIP"
          copy={step.tip}
          isBorderTop
          isHighlight
        />
      </div>
    </article>
  );
}

function RoutineDetail({
  icon,
  title,
  copy,
  isBorderTop = false,
  isHighlight = false,
}: {
  icon: string;
  title: string;
  copy: string;
  isBorderTop?: boolean;
  isHighlight?: boolean;
}) {
  return (
    <div
      className={[
        "grid grid-cols-[24px_1fr] gap-[6px] pt-[9px] mt-[8px]",
        isBorderTop ? "border-t border-[#E4E4E4]" : "",
      ].join(" ")}
    >
      <div className="w-5 h-5 rounded-full bg-[#E9F4F1] text-primary flex items-center justify-center text-[13px] font-bold">
        <i className={icon}></i>
      </div>
      <div>
        <div
          className={[
            "text-[12px] font-bold leading-[1.25]",
            isHighlight ? "text-primary" : "text-black",
          ].join(" ")}
        >
          {title}
        </div>
        <div className="text-[10px] text-black leading-[1.45] mt-[2px]">
          {copy}
        </div>
      </div>
    </div>
  );
}

// ── ProductsSection ──────────────────────────────────────────────────────────

function ProductsSection({
  onRetake,
  onUnlockRoutine,
  variant,
  isLoading,
}: {
  onRetake: () => void;
  onUnlockRoutine: () => void;
  variant: "A" | "B";
  isLoading: boolean;
}) {
  return (
    <section className="mt-[27px]">
      <h2 className="text-[22px] font-bold text-black leading-[1.1] tracking-[-0.01em]">
        Products selected to reduce
        <br />
        trial-and-error
      </h2>
      <p className="text-[12px] text-black leading-[1.45] mt-[17px] mb-[10px]">
        Based on your responses, our Skin AI recommends the following products
        for you.
      </p>

      <div className="grid grid-cols-2 gap-x-[17px] gap-y-4">
        {RESULT_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <button
        type="button"
        className="w-full h-[39px] rounded-[4px] bg-primary text-white text-[14px] font-bold flex items-center justify-center gap-2 mt-6 cursor-pointer border-0"
      >
        <i className="ph-bold ph-plus"></i>
        Add All to Cart
      </button>

      <button
        type="button"
        onClick={onRetake}
        className="block mx-auto mt-[18px] text-[12px] text-primary-dark underline bg-transparent border-0 cursor-pointer"
      >
        Retake Quiz
      </button>

      {/* A/B 테스트: A버전은 기존 안내만, B버전은 커피쿠폰 추가 */}
      {variant === "A" ? (
        // A 버전: 기본 안내
        <section className="mt-[28px] mb-6 rounded-[5px] border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-5 text-center">
          <div className="text-[24px] font-bold text-black mb-2">
            Your Personalized 14-Day Skin Plan
          </div>
          <p className="text-[16px] text-[#666] leading-[1.5] mb-4">
            Build healthier skin with a personalized 14-day skincare routine,
            daily guidance, and expert tips based on your results.
          </p>
          <ResultCtaButton onClick={onUnlockRoutine} disabled={isLoading}>
            <span>Get My 14-Day Plan</span>
            <i className="ph ph-arrow-right"></i>
          </ResultCtaButton>
        </section>
      ) : (
        // B 버전: 안내 + 커피쿠폰 + CTA를 하나의 박스로 통합
        <section className="mt-[28px] mb-6 rounded-[5px] border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-6">
          {/* 상단: 안내 텍스트 */}
          <div className="text-center mb-4">
            <div className="text-[24px] font-bold text-black mb-2">
              Your Personalized 14-Day Skin Plan
            </div>
            <p className="text-[16px] text-[#666] leading-[1.5]">
              Build healthier skin with a personalized 14-day skincare routine,
              daily guidance, and expert tips based on your results.
            </p>
          </div>

          {/* 구분선 */}
          <div className="border-t border-dashed border-[#E5E7EB] my-4" />

          {/* 중간: 커피쿠폰 reward */}
          <div className="flex items-center gap-4 mb-4">
            {/* 왼쪽: 커피컵 일러스트 */}
            <div className="flex-shrink-0 w-[120px] h-[120px]">
              <Image
                src="/images/Coffee.webp"
                alt="Starbucks Coffee Reward"
                width={120}
                height={120}
                className="w-full h-full object-contain transform -rotate-12"
              />
            </div>

            {/* 오른쪽: 텍스트 */}
            <div className="flex-1 flex flex-col justify-center gap-2">
              {/* Beta Reward 태그 */}
              <div className="flex items-center gap-2">
                <span className="text-[18px]">🎁</span>
                <span className="text-[13px] font-semibold text-[#D89A00]">
                  Beta Reward
                </span>
              </div>

              {/* 메인 텍스트 */}
              <div className="leading-[1.2]">
                <div className="text-[28px] font-bold text-black">Receive a</div>
                <div className="text-[28px] font-bold text-[#1FA67A]">Starbucks</div>
                <div className="text-[26px] font-bold text-[#1FA67A]">Coffee Coupon</div>
              </div>

              {/* 서브텍스트 */}
              <p className="text-[13px] text-[#6B7280] leading-[1.4]">
                after completing the survey.
              </p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-dashed border-[#E5E7EB] my-4" />

          {/* 하단: CTA 버튼 */}
          <ResultCtaButton onClick={onUnlockRoutine} disabled={isLoading}>
            <span>Get My 14-Day Plan</span>
            <i className="ph ph-arrow-right"></i>
          </ResultCtaButton>
        </section>
      )}
    </section>
  );
}

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <article className="border border-[#EAEAEA] rounded-[4px] overflow-hidden bg-white">
      <div className="relative h-[154px] bg-[#F7F7F7]">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover"
        />
        <button
          type="button"
          className="absolute top-[7px] right-[7px] w-6 h-6 flex items-center justify-center text-[20px] text-black bg-transparent border-0 cursor-pointer"
          aria-label="Wishlist"
        >
          <i className="ph ph-heart"></i>
        </button>
      </div>
      <div className="p-[7px] pb-[10px]">
        <div className="text-[13px] font-medium text-black leading-[1.22] min-h-[48px]">
          {product.name}
        </div>
        <div className="flex items-baseline gap-[5px] mt-[6px]">
          <span className="text-[12px] font-bold text-[#F05A5A]">
            {product.discount}
          </span>
          <span className="text-[13px] font-bold text-black">
            {product.price}
          </span>
        </div>
        <div className="text-[12px] text-[#B6B6B6] line-through mt-[-2px]">
          {product.original}
        </div>
        <div className="flex items-center gap-[2px] text-primary text-[12px] mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <i key={i} className="ph-fill ph-star"></i>
          ))}
          <span className="text-black text-[10px] ml-1">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <button
          type="button"
          className="w-full h-[31px] rounded-[4px] border border-primary bg-white text-primary text-[13px] font-bold mt-2 flex items-center justify-center gap-[6px] cursor-pointer"
        >
          <i className="ph-bold ph-plus"></i>
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────

function BottomNav({ onRetake }: { onRetake: () => void }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] h-[54px] bg-white border-t border-[#EEEEEE] grid grid-cols-5 z-30"
      aria-label="Result bottom navigation"
    >
      {[
        {
          icon: "ph-fill ph-house",
          label: "Home",
          active: true,
          onClick: undefined,
        },
        {
          icon: "ph ph-shopping-cart",
          label: "Shop",
          active: false,
          onClick: undefined,
        },
        {
          icon: "ph ph-magnifying-glass-plus",
          label: "Quiz",
          active: false,
          onClick: onRetake,
        },
        {
          icon: "ph ph-tag",
          label: "Offers",
          active: false,
          onClick: undefined,
        },
        {
          icon: "ph ph-user",
          label: "Account",
          active: false,
          onClick: undefined,
        },
      ].map(({ icon, label, active, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className={[
            "flex flex-col items-center justify-center gap-[2px]",
            "text-[9px] border-0 bg-transparent cursor-pointer",
            active ? "text-primary" : "text-black",
          ].join(" ")}
        >
          <i className={`${icon} text-[19px]`}></i>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
