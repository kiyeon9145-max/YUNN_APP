"use client";

// Step1.tsx — 이름 / 이메일 / 전화번호 입력 (설문 1번)
//
// 동작 근거 (SurveyService.js validateStepOne, SurveyAnswer.js):
//   • nameValid  = name.trim().length >= 2
//   • emailValid = ALLOWED_INDIAN_EMAIL_DOMAINS 목록 도메인 + 형식 검사
//   • phoneValid = /^[6-9]\d{9}$/ (인도 번호, 10자리)
//   • 세 항목 모두 valid일 때만 Next 버튼 활성화
//   • 이메일/전화 에러 표시: blur 이후 or Next 클릭 시만 노출 (타이핑 중 억제)
//   • 이름: invalid 표시 없음 — 2자 이상이면 즉시 valid check만 표시
//
// 스타일 근거 (survey.css .step-one-*):
//   • title:     font-size 24px, font-weight 700, line-height 1.17, letter-spacing -0.01em, mb 8px
//   • subtitle:  font-size 13px, mb 28px, gap 6px, WhatsApp icon color #3AAE92 font-size 17px
//   • fields:    flex-direction column, gap 21px
//   • card:      min-h 100px, padding 16px 24px 13px 16px, border 1px #EBEBEB, radius 5px, shadow 0 4px 7px rgba(0,0,0,0.08)
//   • card.is-invalid input / .step-phone-row: border-color #E5534B
//   • label:     flex gap 10px, font-size 15px, letter-spacing 0.75px, mb 16px; icon color #3AAE92 font-size 20px
//   • input:     h 36px, border 1px #EBEBEB, radius 5px, px 16px, pr 40px, font-size 12px, letter-spacing 0.6px
//   • valid-check: absolute right 13px, color #3AAE92, font-size 18px
//   • phone-row: grid-cols [94px 1fr], h 36px, border 1px #EBEBEB, radius 5px, overflow hidden
//   • country-select: gap 8px, border-right 1px #EBEBEB, font-size 13px, font-weight 600; flag 16×16 circle; caret 14px
//   • field-error: mt 7px, color #E5534B, font-size 11px, line-height 1.25, letter-spacing 0.2px
//   • secure-box: mt 33px, p 8px 16px, radius 5px, bg #F5FAF9, gap 13px; icon #3AAE92 24px; text font-size 12px gap 3px
//   • actions:   h 69px, mt 30px, gap 25px, buttons 150×40 radius-[12px] text-base font-semibold tracking-[0.8px]

import { useState } from "react";
import { UserInfoSchema } from "../../lib/schemas/survey";
import { SurveyActions } from "../components/button-component";

interface Step1Props {
  onNext: (answers: { name: string; email: string; phone: string }) => void;
  onBack: () => void;
}

type FieldState = "" | "valid" | "invalid";

export default function Step1({ onNext, onBack }: Step1Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // 이메일·전화는 blur 이전엔 invalid를 노출하지 않는다 (SurveyService.js 설계)
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  // Next 클릭 시 강제 에러 노출
  const [submitted, setSubmitted] = useState(false);

  // Zod 스키마로 전체 입력값 검증
  const userInfoResult = UserInfoSchema.safeParse({ name, email, phone });
  const fieldErrors = !userInfoResult.success ? userInfoResult.error.flatten().fieldErrors : {};

  const nameValid = name.trim().length >= 2;
  const emailValid = !fieldErrors.email;
  const phoneValid = !fieldErrors.phone;
  const isComplete = userInfoResult.success;

  // 이름은 valid check만 표시 (is-invalid 없음)
  const nameCardState: FieldState = nameValid ? "valid" : "";
  const emailCardState: FieldState = emailValid
    ? "valid"
    : (emailTouched || submitted) && email.trim()
      ? "invalid"
      : "";
  const phoneCardState: FieldState = phoneValid
    ? "valid"
    : (phoneTouched || submitted) && phone.trim()
      ? "invalid"
      : "";

  const handleNext = () => {
    if (!isComplete) {
      setSubmitted(true);
      alert("Please fill out all fields.");
      return;
    }
    onNext({ name: name.trim(), email: email.toLowerCase().trim(), phone });
  };

  return (
    <>
      {/* ── 제목 ─────────────────────────────────────────────────────
          survey.css: font-size 24px, font-weight 700, line-height 1.17,
          letter-spacing -0.01em, mb 8px; span color #3AAE92
          ──────────────────────────────────────────────────────────── */}
      <h2 className="text-[24px] font-bold leading-[1.17] tracking-[-0.01em] text-black mb-[8px]">
        Let&apos;s Start
        <br />
        <span className="text-primary">with the basics</span>
      </h2>

      {/* ── 소제목 ───────────────────────────────────────────────────
          font-size 13px, mb 28px, gap 6px; WhatsApp icon color #3AAE92 font-size 17px
          ──────────────────────────────────────────────────────────── */}
      <p className="text-[13px] font-normal leading-[1.45] text-black mb-[28px] flex items-center gap-[6px] whitespace-nowrap">
        Your routine will be delivered via WhatsApp.
        <i className="ph ph-whatsapp-logo text-[17px] text-primary"></i>
      </p>

      {/* ── 필드 목록 (gap 21px) ─────────────────────────────────── */}
      <div className="flex flex-col gap-[21px]">
        {/* ─ 이름 카드 ─────────────────────────────────────────── */}
        <FieldCard>
          <FieldLabel icon="ph-user" label="Your Name" />
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            {nameCardState === "valid" && <ValidCheck />}
          </div>
        </FieldCard>

        {/* ─ 이메일 카드 ───────────────────────────────────────── */}
        <FieldCard>
          <FieldLabel icon="ph-envelope-simple" label="Email" />
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={[
                inputClass,
                // survey.css .step-one-card.is-invalid input: border-color #E5534B
                emailCardState === "invalid" ? "!border-[#E5534B]" : "",
              ].join(" ")}
            />
            {emailCardState === "valid" && <ValidCheck />}
          </div>
          {emailCardState === "invalid" && (
            <p className="mt-[7px] text-[#E5534B] text-[11px] leading-[1.25] tracking-[0.2px]">
              Please enter a valid email address.
            </p>
          )}
        </FieldCard>

        {/* ─ 전화번호 카드 ─────────────────────────────────────── */}
        <FieldCard>
          <FieldLabel icon="ph-phone" label="Phone Number" />
          {/* phone-row: grid [94px 1fr], h 36px, border 1px #EBEBEB, radius 5px */}
          <div
            className={[
              "grid h-9 border rounded-[5px] overflow-hidden bg-white",
              phoneCardState === "invalid"
                ? "border-[#E5534B]"
                : "border-[#EBEBEB]",
            ].join(" ")}
            style={{ gridTemplateColumns: "94px 1fr" }}
          >
            {/* 국가 선택 (인도 고정, MVP에서 드롭다운 미구현) */}
            <div className="flex items-center justify-center gap-2 border-r border-[#EBEBEB] text-[13px] font-semibold tracking-[0.4px] text-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://flagcdn.com/w40/in.png"
                alt="India"
                className="w-4 h-4 rounded-full"
              />
              <span>+91</span>
              <i className="ph ph-caret-down text-[14px] text-black"></i>
            </div>
            <div className="relative">
              <input
                type="tel"
                placeholder="Enter your phone number"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(v);
                }}
                onBlur={() => setPhoneTouched(true)}
                className={[
                  "w-full h-[34px] border-0 rounded-none bg-white",
                  "px-4 pr-[40px] text-xs font-normal tracking-[0.6px] outline-none text-black",
                  "placeholder:text-[#9D9BA0]",
                ].join(" ")}
              />
              {phoneCardState === "valid" && (
                <i className="ph-fill ph-check-circle absolute right-[12px] top-1/2 -translate-y-1/2 text-primary text-[18px] pointer-events-none"></i>
              )}
            </div>
          </div>
          {phoneCardState === "invalid" && (
            <p className="mt-[7px] text-[#E5534B] text-[11px] leading-[1.25] tracking-[0.2px]">
              Please enter a valid Indian phone number.
            </p>
          )}
        </FieldCard>
      </div>

      {/* ── 보안 안내 박스 ────────────────────────────────────────────
          mt 33px, p 8px 16px, bg #F5FAF9, radius 5px, gap 13px
          icon: color #3AAE92, text-2xl; text: font-size 12px, gap 3px
          ──────────────────────────────────────────────────────────── */}
      <div className="w-full min-h-[47px] mt-[33px] px-4 py-2 rounded-[5px] bg-[#F5FAF9] flex items-center gap-[13px] text-black">
        <i className="ph ph-user-focus text-2xl text-primary flex-shrink-0"></i>
        <div className="flex flex-col gap-[3px] text-xs leading-[1.2] font-normal tracking-[0.2px] whitespace-nowrap">
          <span>Your information is 100% safe and secure.</span>
          <span>We never share your data with anyone.</span>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────
          h 69px, mt 30px (Step2는 38px), gap 25px
          buttons: 150×40, rounded-[12px], text-base, font-semibold, tracking-[0.8px]
          ──────────────────────────────────────────────────────────── */}
      <SurveyActions
        className="mt-[30px]"
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={!isComplete}
      />
    </>
  );
}

// ── 공통 인라인 컴포넌트 ────────────────────────────────────────────────────

// 카드 테두리·그림자는 유효성 무관 동일. invalid 색상은 각 input에서 직접 처리한다.
function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-[100px] p-[16px_24px_13px_16px] bg-white border border-[#EBEBEB] rounded-[5px] shadow-[0_4px_7px_rgba(0,0,0,0.08)]">
      {children}
    </div>
  );
}

// survey.css .step-one-label: flex gap 10px, font-size 15px, font-weight 400, letter-spacing 0.75px, mb 16px
// icon: color #3AAE92, font-size 20px
function FieldLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-[10px] text-[15px] font-normal leading-[1.2] tracking-[0.75px] text-black mb-4">
      <i className={`ph ${icon} text-[20px] text-primary`}></i>
      <span>{label}</span>
    </div>
  );
}

// survey.css .step-one-card input (with .step-input-wrap pr 40px)
// invalid 상태는 카드 자체 is-invalid 클래스로 처리하므로, input은 별도로 invalid 스타일을 받는다
const inputClass = [
  "w-full h-9 border border-[#EBEBEB] rounded-[5px] bg-white",
  "px-4 pr-[40px] text-xs font-normal tracking-[0.6px] outline-none text-black",
  "placeholder:text-[#9D9BA0]",
  "focus:border-primary transition-colors",
].join(" ");

// survey.css .step-valid-check: absolute right 13px, top 50%, color #3AAE92, font-size 18px
export function ValidCheck() {
  return (
    <i className="ph-fill ph-check-circle absolute right-[13px] top-1/2 -translate-y-1/2 text-primary text-[18px] pointer-events-none"></i>
  );
}
