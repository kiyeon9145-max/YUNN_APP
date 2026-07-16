"use client";

// HomeBottomNav.tsx — 하단 네비게이션
//
// 현재 경로가 '/'이면 Home 탭 활성화.
// 다른 페이지(survey 등)에서도 재사용 가능하도록 activeHref prop으로 확장 가능.
// home.css .bottom-nav: fixed, max-w-393px, grid-cols-5, h-46px

import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", icon: "ph-fill ph-house", label: "Home", exact: true },
  { href: "#shop", icon: "ph ph-shopping-cart-simple", label: "Shop" },
  { href: "/survey", icon: "ph ph-plus-circle", label: "Quiz" },
  { href: "#offers", icon: "ph ph-ticket", label: "Offers" },
  { href: "#account", icon: "ph ph-user", label: "Account" },
] as const;

interface HomeBottomNavProps {
  activeHref?: string;
}

export default function HomeBottomNav({
  activeHref = "/",
}: HomeBottomNavProps) {
  return (
    <nav
      className="fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[393px] h-[46px] border-t border-[#F2F2F2] bg-white z-30 grid grid-cols-5 px-[16px] pt-[6px]"
      aria-label="Primary"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeHref === item.href;
        const isExternal = item.href.startsWith("#");

        const cls = `flex flex-col items-center gap-[3px] text-[12px] leading-[10px] no-underline ${
          isActive ? "text-[#3AAE92]" : "text-black"
        }`;

        return isExternal ? (
          <a key={item.href} href={item.href} className={cls}>
            <i className={`${item.icon} text-[20px] leading-[20px]`} />
            <span>{item.label}</span>
          </a>
        ) : (
          <Link key={item.href} href={item.href} className={cls}>
            <i className={`${item.icon} text-[20px] leading-[20px]`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
