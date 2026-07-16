"use client";

// HomeSidebar.tsx — 슬라이드인 사이드바 메뉴
//
// home.css .sidebar / .sidebar-panel:
//   너비 246px, 왼쪽에서 슬라이드인, 배경 블러 스크림은 page.tsx에서 처리.
//   open=false → -translate-x-[105%] invisible / open=true → translate-x-0 visible

import Link from "next/link";

const MENU_ITEMS = [
  { label: "Home", href: "/", isInternal: true },
  { label: "Skin", href: "#", isInternal: false },
  { label: "Routine Program", href: "/survey", isInternal: true },
  { label: "Treatment Finder", href: "/survey", isInternal: true },
  { label: "About YUNN", href: "#", isInternal: false },
] as const;

interface HomeSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function HomeSidebar({ open, onClose }: HomeSidebarProps) {
  return (
    <aside
      className={`fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-[45] ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-label="Menu"
    >
      <div
        className={`relative w-[246px] h-full bg-white pt-[58px] px-[22px] shadow-[8px_0_28px_rgba(0,0,0,0.14)] transition-[transform,visibility] duration-[240ms] ${
          open ? "translate-x-0 visible" : "-translate-x-[105%] invisible"
        }`}
      >
        <button
          type="button"
          className="absolute top-[18px] right-[18px] text-[24px] bg-transparent"
          onClick={onClose}
          aria-label="Close menu"
        >
          <i className="ph ph-x" />
        </button>

        {MENU_ITEMS.map((item) =>
          item.isInternal ? (
            <Link
              key={item.label}
              href={item.href}
              className="block text-[18px] font-medium mb-[24px] no-underline text-black"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.label}
              href={item.href}
              className="block text-[18px] font-medium mb-[24px] no-underline text-black"
            >
              {item.label}
            </a>
          ),
        )}
      </div>
    </aside>
  );
}
