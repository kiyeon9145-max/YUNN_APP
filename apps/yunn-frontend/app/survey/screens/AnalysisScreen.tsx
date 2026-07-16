"use client";

// AnalysisScreen.tsx — 분석 로딩 화면
//
// 4개 메시지를 600ms 간격으로 순환 표시해 분석 진행 중임을 시각적으로 연출한다.
// 4번째 메시지 표시 후 onComplete를 호출해 결과 화면으로 전환한다.
//
// 동작 근거 (SurveyScreen.js #startAnalysis):
//   messages 4개, setInterval 600ms, i===4 에서 clearInterval 후 resultScreen.show()

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  "Analysing skin concern patterns...",
  "Mapping daily environment...",
  "Calibrating routine intensity...",
  "Finalising your plan...",
];

export default function AnalysisScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [msgIndex, setMsgIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    let count = 0;
    const id = setInterval(() => {
      count++;
      if (count < MESSAGES.length) {
        setMsgIndex(count);
      } else {
        clearInterval(id);
        onCompleteRef.current();
      }
    }, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
      {/* 스피너 — survey.css .spinner: 50px, border-4, border-[#E9F4F1], border-t-primary */}
      <div className="w-[50px] h-[50px] rounded-full border-4 border-[#E9F4F1] border-t-primary animate-spin mb-[30px]" />

      <h2 className="text-[1.6rem] font-bold text-black leading-[1.12] tracking-[-0.02em] mb-2">
        Building your routine.
      </h2>

      <p className="text-[1rem] text-[#999] leading-[1.5] mb-5">
        We&apos;re cross-referencing your skin profile,
        <br />
        lifestyle data, and environment.
      </p>

      <p className="text-[15px] font-semibold text-primary">
        {MESSAGES[msgIndex]}
      </p>
    </div>
  );
}
