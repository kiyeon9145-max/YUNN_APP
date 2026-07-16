"use client";

// BenefitCard.tsx — 아이콘 + 제목 + 설명으로 구성된 혜택 카드
// /routine/intro 페이지에서 "What You'll Get" 목록에 반복 사용된다.

import Image from "next/image";

interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-card bg-white px-4 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary-light">
        <Image src={icon} alt="" width={128} height={128} className="object-contain" />
      </div>
      <div>
        <div className="text-[15px] font-bold text-ink">{title}</div>
        <div className="mt-1 text-[13px] leading-[1.4] text-ink-faint">
          {description}
        </div>
      </div>
    </div>
  );
}
