"use client";

// TopSellingSection.tsx — 인기 상품 수평 무한 스크롤
//
// 구현 방식: 아이템을 3벌 복사 → 중간 세트 시작 → 양 끝 이탈 시 순간 이동
//   [A,B,C | A,B,C | A,B,C]
//            ↑ 여기서 시작
//
// 시각적으로 seamless한 이유: 위치 x와 x±setWidth의 컨텐츠가 동일하므로
// 순간 이동 후 화면에 보이는 내용이 이동 전과 같다.
//
// 상품 추가: home-data.ts의 TOP_SELLING 배열에 항목 추가만 하면 자동 반영.
// ProductCard는 별도 컴포넌트라 레이아웃 변경 시 여기를 건드릴 필요 없음.

import { useEffect, useRef, useState } from "react";
import { TOP_SELLING, type CartItem } from "./home-data";
import ProductCard from "./ProductCard";

const LOOP_ITEMS = [...TOP_SELLING, ...TOP_SELLING, ...TOP_SELLING];
const CARD_W = 148; // 카드 고정 너비 (px)
const CARD_GAP = 12; // 카드 간격 (px)

interface TopSellingSectionProps {
  onAddToCart: (item: CartItem) => void;
}

export default function TopSellingSection({
  onAddToCart,
}: TopSellingSectionProps) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 마우스 드래그용 내부 상태 — re-render 없이 관리
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const didDrag = useRef(false); // 드래그 vs 클릭 구분

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // 중간 세트 시작 위치로 초기화 — SSR 위치(0)와 달리 클라이언트에서만 적용
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const setWidth = (CARD_W + CARD_GAP) * TOP_SELLING.length;
    el.scrollLeft = setWidth;
    setReady(true);
  }, []);

  // 양 끝 이탈 감지 → 같은 시각적 위치의 중간 세트로 순간 이동
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const setWidth = (CARD_W + CARD_GAP) * TOP_SELLING.length;
    if (el.scrollLeft < setWidth) {
      el.scrollLeft += setWidth;
    } else if (el.scrollLeft >= setWidth * 2) {
      el.scrollLeft -= setWidth;
    }
  };

  // ── 마우스 드래그 핸들러 (데스크탑) ──────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setDragging(true);
    didDrag.current = false;
    dragStart.current = { x: e.pageX, scrollLeft: el.scrollLeft };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const delta = e.pageX - dragStart.current.x;
    if (Math.abs(delta) > 3) didDrag.current = true; // 3px 이상 움직여야 드래그로 인식
    el.scrollLeft = dragStart.current.scrollLeft - delta;
  };

  const handleMouseUp = () => setDragging(false);

  // 버튼 클릭 이벤트가 드래그 중에 발화되지 않도록 캡처 단계에서 차단
  const handleClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) e.stopPropagation();
  };

  return (
    <section aria-labelledby="selling-title">
      <div className="flex items-center justify-between mt-[23px] mb-[12px]">
        <h2 id="selling-title" className="text-[16px] font-normal">
          Top Selling
        </h2>
        <a
          href="#"
          className="inline-flex items-center gap-[7px] text-[14px] no-underline"
        >
          View all <i className="ph ph-caret-right" />
        </a>
      </div>

      {/* 스크롤 컨테이너
          -mx-[17px] px-[17px]: 부모 패딩을 상쇄해 전체 너비로 확장
          select-none: 드래그 중 텍스트 선택 방지
          cursor-grab/grabbing: 마우스 드래그 UX 피드백 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClickCapture={handleClickCapture}
        className={`-mx-[17px] px-[17px] overflow-x-auto flex gap-[12px] pb-[4px] select-none transition-opacity duration-150 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        } ${ready ? "opacity-100" : "opacity-0"}`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollBehavior: "auto",
        }}
      >
        {LOOP_ITEMS.map((product, i) => (
          <div
            key={`${product.id}-${i}`}
            style={{ width: CARD_W, flexShrink: 0 }}
          >
            <ProductCard
              product={product}
              wishlisted={wishlist.has(product.id)}
              onWishlist={() => toggleWishlist(product.id)}
              onAddToCart={() =>
                onAddToCart({
                  name: product.name,
                  imageSrc: product.imageSrc,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  discount: product.discount,
                })
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}
