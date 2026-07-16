"use client";

// StartScreen.tsx — 루틴 시작 전 Before 사진 촬영 화면

import { useState } from "react";
import PhotoCapture from "../components/PhotoCapture";
import type { RoutinePhoto } from "../lib/routine-storage";

interface StartScreenProps {
  onStart: (photo: RoutinePhoto) => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [photo, setPhoto] = useState<RoutinePhoto | null>(null);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col bg-white px-6 pb-10 pt-16">
      <h1 className="mb-2 text-[22px] font-bold leading-[1.2] text-black">
        Let&apos;s start your
        <br />
        <span className="text-primary">14-day routine</span>
      </h1>
      <p className="mb-6 text-[13px] text-[#666]">
        Take a Before photo so you can see your progress on Day 14.
      </p>

      <PhotoCapture buttonLabel="Take Before Photo" onCapture={setPhoto} />

      <button
        type="button"
        disabled={!photo}
        onClick={() => {
          // Before 사진이 준비된 경우에만 루틴을 시작할 수 있다
          if (photo) onStart(photo);
        }}
        className="mt-6 h-[46px] w-full cursor-pointer rounded-[5px] border-0 bg-primary text-[14px] font-bold text-white disabled:opacity-40"
      >
        Start My Routine
      </button>
    </div>
  );
}
