"use client";

// IntroScreen.tsx — 설문 진입 전 히어로 화면 (page.tsx에서 분리)
// 버튼 클릭 시 onStart() 콜백으로 다음 스텝 이동을 page.tsx에 위임한다.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StartSurveyButton } from "../components/button-component";

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full max-w-phone-max min-h-screen mx-auto bg-white relative pb-3">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="h-14 px-shell-x flex justify-between items-center relative bg-white">
        {menuOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        <div className="relative z-20">
          <i
            role="button"
            aria-label="메뉴 열기"
            onClick={() => setMenuOpen((o) => !o)}
            className="ph ph-list text-2xl cursor-pointer text-black"
          ></i>
          {menuOpen && (
            <div className="absolute left-0 top-[calc(100%+10px)] w-[220px] rounded-[8px] border border-line bg-white py-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <div className="px-4 py-2 text-xs font-semibold tracking-[0.4px] text-ink-muted">
                Quiz
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onStart();
                }}
                className="block w-full cursor-pointer px-4 py-3 text-left text-sm text-black transition-colors hover:bg-primary-light"
              >
                지금 피부 루틴 가이드
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/survey/ingredient-check");
                }}
                className="block w-full cursor-pointer px-4 py-3 text-left text-sm text-black transition-colors hover:bg-primary-light"
              >
                성분 분석
              </button>
            </div>
          )}
        </div>
        <div
          className="absolute left-1/2 top-1/2 w-[128px] h-[58px] overflow-visible cursor-pointer z-[1]"
          style={{
            transform: "translate(-50%, -50%) scale(1.75)",
            transformOrigin: "center",
          }}
          onClick={() => router.push('/')}
        >
          <div className="relative w-full h-full">
            <Image
              src="/images/yunn_logo.png"
              alt="YUNN"
              fill
              className="object-contain"
              priority
              sizes="128px"
            />
          </div>
        </div>
        <div className="flex items-center gap-[14px] relative z-[2]">
          <i className="ph ph-user text-2xl cursor-pointer text-black"></i>
          <div className="relative">
            <i className="ph ph-shopping-bag text-2xl cursor-pointer text-black"></i>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="px-shell-x">
        <div className="relative min-h-[268px]">
          <div className="relative z-[2] w-[206px]">
            <div className="text-xl font-semibold leading-[1.45] tracking-[-0.01em] text-black mb-5">
              <p className="mb-[18px]">
                Your acne
                <br />
                keeps <span className="text-primary">coming back.</span>
              </p>
              <p className="mb-[18px]">
                Your dark spots
                <br />
                <span className="text-primary">won&apos;t fade.</span>
              </p>
              <p>
                Let&apos;s find out <span className="text-primary">why.</span>
              </p>
            </div>
            <div className="text-xs font-normal leading-[1.66] text-black">
              Answer a few quick questions
              <br />
              and get your personalized
              <br />
              skin routine.
            </div>
          </div>
          <div
            className="absolute right-[-19px] top-1 w-[188px] h-[262px] z-[1]"
            aria-hidden="true"
          >
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 rounded-[15px_0_0_15px]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, #effaf7 48%, #c7ede4 100%)",
                }}
              />
              <Image
                src="/images/survey.start.image.png"
                alt=""
                fill
                className="object-cover object-[58%_center] rounded-[15px_0_0_15px]"
                sizes="188px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-[19px] mb-[35px] border-t border-b border-line py-[14px]">
          <div className="flex flex-col items-center gap-1.5 text-xs font-normal text-ink text-center flex-1">
            <i className="ph-light ph-clock text-2xl text-primary"></i>
            <span>Takes 3 minutes</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-xs font-normal text-ink text-center flex-1">
            <i className="ph-light ph-user-focus text-2xl text-primary"></i>
            <span>100% Private</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-xs font-normal text-ink text-center flex-1">
            <i className="ph-light ph-sparkle text-2xl text-primary"></i>
            <span>Personalized for you</span>
          </div>
        </div>

        <div className="text-sm font-normal leading-[1.55] text-black mb-[38px] tracking-[-0.01em]">
          <div className="mb-[15px]">Most routines fail</div>
          <div className="mb-[15px]">
            because they&apos;re built on{" "}
            <span className="font-bold text-primary">guesswork.</span>
          </div>
          <div className="mb-[15px]">
            YUNN <span className="font-bold text-primary">analyzes</span> your
            skin,
          </div>
          <div className="mb-[15px]">
            your <span className="font-bold text-primary">environment,</span>
          </div>
          <div className="mb-[15px]">
            and your <span className="font-bold text-primary">lifestyle</span>{" "}
            then builds
          </div>
          <div className="mb-[15px]">
            a <span className="font-bold text-primary">14-day routine</span>
          </div>
          <div>designed specifically for you.</div>
        </div>

        <StartSurveyButton onClick={onStart} />

        <div className="text-xs font-normal text-ink-muted text-center mt-4">
          Takes 3 minutes. Results in 24 hours.
        </div>
      </div>

      <div
        className="w-[134px] h-[5px] mx-auto mt-[7px] rounded-full bg-black"
        aria-hidden="true"
      />
    </div>
  );
}
