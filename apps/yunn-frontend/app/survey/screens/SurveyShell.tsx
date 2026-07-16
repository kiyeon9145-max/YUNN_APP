"use client";

// SurveyShell.tsx — 설문 스텝 공통 껍데기 (상태바 + 헤더 + 프로그레스 바 + 콘텐츠)
// survey.css 수치 근거:
//   .survey-app-shell:      max-w 393px, min-h 852px, pb 26px
//   .survey-top-header:     h 104px, px 24px, icons mt 39px
//   .survey-logo-mark:      top 51px, scale(1.75) (진단 화면과 동일)
//   .progress-wrapper:      h 4px, bg #d7d7d7, mb 18px
//   .progress-bar:          bg #5cc1a6, transition width 0.3s
//   .step-indicator:        text-xs, mb 14px
//   .survey-content:        px 25px, pb 30px

import Image from "next/image";
import Link from "next/link";

interface SurveyShellProps {
  currentStep: number; // 현재 스텝 번호 (1~10)
  totalSteps?: number; // 전체 스텝 수 (기본 10)
  children: React.ReactNode;
}

export default function SurveyShell({
  currentStep,
  totalSteps = 10,
  children,
}: SurveyShellProps) {
  // SurveyScreen.js updateProgress() 근거: progressStep / DISPLAYED_PAGES * 100
  const progressPct = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-phone-max min-h-[852px] mx-auto bg-white relative pb-[26px]">
      {/* ── Top Header (h 104px) ──────────────────────────────────
          아이콘은 mt-[39px]로 세로 중앙 정렬.
          로고는 absolute left-1/2 top-[51px] — 진단 화면과 동일한 scale(1.75).
          ──────────────────────────────────────────────────────────── */}
      <div className="h-[104px] px-6 flex justify-between items-start relative bg-white">
        <i className="ph ph-list text-[23px] cursor-pointer text-black mt-[39px] relative z-[2]"></i>

        <Link
          href="/"
          className="absolute left-1/2 w-[128px] h-[58px] overflow-visible z-[1]"
          style={{
            top: "51px",
            transform: "translate(-50%, -50%) scale(1.75)",
            transformOrigin: "center",
          }}
          aria-label="YUNN 홈으로 이동"
        >
          <div className="relative w-full h-full">
            <Image
              src="/images/yunn_logo.png"
              alt="YUNN"
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
        </Link>

        <div className="flex items-center gap-[10px] relative z-[2] mt-[39px]">
          <i className="ph ph-user text-[23px] cursor-pointer text-black"></i>
          <div className="w-6 h-6 inline-flex items-center justify-center relative">
            <i className="ph ph-shopping-bag text-[23px] cursor-pointer text-black"></i>
          </div>
        </div>
      </div>

      {/* ── Progress Bar + Step Indicator ─────────────────────────
          .progress-wrapper: h 4px, bg #d7d7d7, mb 18px
          .progress-bar:     bg #5cc1a6, transition width 300ms
          .step-indicator:   text-xs, mb 14px
          ──────────────────────────────────────────────────────────── */}
      <div className="bg-white px-[25px] relative z-10">
        <div className="w-full h-1 bg-[#d7d7d7] rounded-sm overflow-hidden mb-[18px]">
          <div
            className="h-full bg-[#5cc1a6] transition-[width] duration-300 ease-in-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-xs text-black mb-[14px] font-normal">
          Page {currentStep} of {totalSteps}
        </div>
      </div>

      {/* ── Step Content ─────────────────────────────────────────── */}
      <div className="px-[25px] pb-[30px]">{children}</div>
    </div>
  );
}
