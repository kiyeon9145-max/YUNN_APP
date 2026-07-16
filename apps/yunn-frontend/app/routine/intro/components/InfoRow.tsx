"use client";

// InfoRow.tsx — 아이콘 + 한 줄 안내 텍스트로 구성된 정보 행
// /routine/intro 페이지의 "About 1 minute" / 개인정보 안내 등에 반복 사용된다.

interface InfoRowProps {
  icon: string;
  children: React.ReactNode;
}

export default function InfoRow({ icon, children }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-[#F7FCFB] px-4 py-3 text-[13px] text-ink-faint">
      <i className={`${icon} text-lg text-primary flex-shrink-0`}></i>
      <span>{children}</span>
    </div>
  );
}
