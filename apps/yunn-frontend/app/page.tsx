"use client";

// page.tsx — 홈 페이지 오케스트레이터
//
// 이 파일은 오버레이 상태(카트·사이드바)만 관리한다.
// 개별 UI 로직은 각 컴포넌트 파일에 캡슐화되어 있다.
//
// 확장 포인트:
//   - 상품 추가: app/home/home-data.ts의 TOP_SELLING 배열에 항목 추가
//   - 카테고리 추가: app/home/home-data.ts의 CATEGORIES 배열에 항목 추가
//   - 새 섹션 추가: 컴포넌트 파일 생성 후 <main> 안에 배치

import { useState } from "react";
import HomeHeader from "./home/HomeHeader";
import HeroCard from "./home/HeroCard";
import CategorySection from "./home/CategorySection";
import TopSellingSection from "./home/TopSellingSection";
import HomeBottomNav from "./home/HomeBottomNav";
import CartSheet from "./home/CartSheet";
import HomeSidebar from "./home/HomeSidebar";
import { type CartItem } from "./home/home-data";

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAddToCart = (item: CartItem) => {
    setCartCount((c) => c + 1);
    setCartItem(item);
    setCartOpen(true);
  };

  const closeAll = () => {
    setCartOpen(false);
    setSidebarOpen(false);
  };
  const overlayOpen = cartOpen || sidebarOpen;

  return (
    <div className="w-full max-w-[393px] min-h-screen mx-auto bg-white relative pb-[72px] overflow-x-hidden">
      <HomeHeader
        cartCount={cartCount}
        onMenu={() => setSidebarOpen(true)}
        onCart={() => setCartOpen(true)}
      />

      <main className="pt-[19px] px-[17px]">
        <HeroCard />
        <CategorySection />
        <TopSellingSection onAddToCart={handleAddToCart} />
      </main>

      <HomeBottomNav activeHref="/" />

      {/* 딤드 스크림 — 카트·사이드바 열릴 때 공통 사용 */}
      <div
        className={`fixed inset-0 bg-black/25 z-[39] transition-opacity duration-200 ${
          overlayOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAll}
      />

      <CartSheet
        open={cartOpen}
        count={cartCount}
        item={cartItem}
        onClose={closeAll}
        onViewCart={() =>
          alert(
            "Checkout is coming soon. Your selected products are saved in this session.",
          )
        }
      />
      <HomeSidebar open={sidebarOpen} onClose={closeAll} />
    </div>
  );
}
