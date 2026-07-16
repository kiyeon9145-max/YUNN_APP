"use client";

// GuardScreen.tsx — 진단 결과가 없을 때 노출되는 안내 화면

import Link from "next/link";

export default function GuardScreen() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col items-center justify-center gap-4 bg-white px-8 text-center">
      <i className="ph ph-clipboard-text text-[48px] text-primary" />
      <h1 className="text-[20px] font-bold text-black">Take your skin quiz first</h1>
      <p className="text-[13px] leading-[1.5] text-[#666]">
        We need your skin diagnosis result to build your personalized routine.
      </p>
      <Link
        href="/survey"
        className="mt-2 flex h-[46px] w-full items-center justify-center rounded-[5px] bg-primary text-[14px] font-bold text-white no-underline"
      >
        Take the quiz
      </Link>
    </div>
  );
}
