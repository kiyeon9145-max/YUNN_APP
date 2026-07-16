"use client";

// CategorySection.tsx — 카테고리 그리드
//
// CATEGORIES 배열을 순회해 렌더링한다.
// 새 카테고리는 home-data.ts의 CATEGORIES에 항목만 추가하면 자동 반영된다.
// home.css .category-grid: grid-cols-4, gap-x-10px gap-y-16px

import Image from "next/image";
import { CATEGORIES } from "./home-data";

export default function CategorySection() {
  return (
    <section aria-labelledby="category-title">
      <div className="flex items-center justify-between mt-[23px] mb-[12px]">
        <h2 id="category-title" className="text-[16px] font-normal">
          Shop by Category
        </h2>
        <a
          href="#"
          className="inline-flex items-center gap-[7px] text-[14px] no-underline"
        >
          View all <i className="ph ph-caret-right" />
        </a>
      </div>

      <div className="grid grid-cols-4 gap-x-[10px] gap-y-[16px]">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="text-center min-w-0">
            {/* 원형 이미지 — home.css .category-image */}
            <div className="relative w-[78px] h-[78px] mx-auto mb-[5px] rounded-full bg-[#F2F2F2] flex items-center justify-center">
              {cat.isNew && (
                <span className="absolute left-[2px] top-[-6px] rounded-[3px] bg-[#5CC1A6] text-white text-[12px] leading-[18px] h-[18px] min-w-[44px] px-[8px] z-[3] text-center font-normal shadow-sm">
                  NEW
                </span>
              )}
              <Image
                src={cat.imageSrc}
                alt={cat.label}
                width={65}
                height={65}
                className="w-[65px] h-[65px] object-contain"
              />
            </div>
            <span className="text-[14px] leading-[1.15]">{cat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
