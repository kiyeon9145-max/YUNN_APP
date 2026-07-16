"use client";

// CompareScreen.tsx — Day 14+ After 사진 완료 후 Before/After 나란히 비교하는 화면

import { useEffect } from "react";
import type { RoutinePhoto } from "../lib/routine-storage";
import { trackCompareViewed } from "@/app/lib/analytics";

interface CompareScreenProps {
  day: number;
  streak: number;
  beforePhoto: RoutinePhoto | null;
  afterPhoto: RoutinePhoto | null;
}

export default function CompareScreen({
  day,
  streak,
  beforePhoto,
  afterPhoto,
}: CompareScreenProps) {
  useEffect(() => {
    // 화면 최초 진입 시 1회만 조회 이벤트 발행
    trackCompareViewed(day, streak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[393px] bg-white px-6 pb-10 pt-10 text-center">
      <div className="mb-2 text-[28px]">🎉</div>
      <h1 className="mb-1 text-[20px] font-bold text-black">14 Days Complete!</h1>
      <p className="mb-6 text-[13px] text-[#666]">See how far your skin has come.</p>

      <div className="grid grid-cols-2 gap-3">
        <PhotoBlock label="Before" photo={beforePhoto} />
        <PhotoBlock label="After" photo={afterPhoto} />
      </div>

      <div className="mt-6 text-[12px] text-[#999]">🔥 {streak} Day Streak</div>
    </div>
  );
}

function PhotoBlock({ label, photo }: { label: string; photo: RoutinePhoto | null }) {
  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden rounded-[8px] border border-[#EAEAEA] bg-[#F5F5F5]">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.dataUrl} alt={label} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="mt-2 text-[12px] font-bold text-black">{label}</div>
      {photo && <div className="text-[10px] text-[#999]">{photo.date}</div>}
    </div>
  );
}
