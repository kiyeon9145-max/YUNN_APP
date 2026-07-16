"use client";

// HomeHeader.tsx — 홈 전용 헤더
//
// 카트 뱃지 숫자와 열기/메뉴 콜백은 page.tsx에서 내려받는다.
// home.css .top-header: h-56px, sticky, blur backdrop

import Image from "next/image";
import Link from "next/link";

interface HomeHeaderProps {
  cartCount: number;
  onMenu: () => void;
  onCart: () => void;
}

export default function HomeHeader({
  cartCount,
  onMenu,
  onCart,
}: HomeHeaderProps) {
  return (
    <header className="h-[56px] border-b border-[#E5E5E5] flex items-center justify-between px-[17px] sticky top-0 z-20 bg-white/[0.94] backdrop-blur-[10px]">
      <button
        type="button"
        className="w-[28px] h-[28px] inline-flex items-center justify-center text-[23px]"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <i className="ph ph-list" />
      </button>

      {/* 로고 — home.css .logo: absolute center, scale 1.75 */}
      <Link href="/" className="absolute left-1/2 top-[28px] -translate-x-1/2 -translate-y-1/2" aria-label="YUNN 홈으로 이동">
        <Image
          src="/images/yunn_logo.png"
          alt="YUNN"
          width={73}
          height={33}
          className="object-contain scale-[1.75]"
          priority
        />
      </Link>

      <div className="flex items-center gap-[9px]">
        <button
          type="button"
          className="w-[28px] h-[28px] inline-flex items-center justify-center text-[23px]"
          aria-label="Search"
        >
          <i className="ph ph-magnifying-glass" />
        </button>
        <button
          type="button"
          className="w-[28px] h-[28px] inline-flex items-center justify-center text-[23px]"
          aria-label="Notifications"
        >
          <i className="ph ph-bell" />
        </button>
        <button
          type="button"
          className="relative w-[28px] h-[28px] inline-flex items-center justify-center text-[23px]"
          onClick={onCart}
          aria-label="Open cart"
        >
          <i className="ph ph-shopping-bag" />
          {cartCount > 0 && (
            <span className="absolute -right-[4px] -top-[3px] min-w-[14px] h-[14px] px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
