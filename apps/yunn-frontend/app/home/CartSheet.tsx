"use client";

// CartSheet.tsx — 카트 바텀시트
//
// 슬라이드업 방식. open 상태는 page.tsx에서 관리하고 prop으로 받는다.
// MVP: 단일 항목 표시. 추후 items: CartItem[] 배열로 확장 가능.
// home.css .cart-sheet: fixed bottom-0, translate-y(105%) → 0, rounded-t-20px

import { type CartItem } from "./home-data";

interface CartSheetProps {
  open: boolean;
  count: number;
  item: CartItem | null;
  onClose: () => void;
  onViewCart: () => void;
}

export default function CartSheet({
  open,
  count,
  item,
  onClose,
  onViewCart,
}: CartSheetProps) {
  return (
    <aside
      className={`fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[393px] min-h-[271px] rounded-t-[20px] bg-white z-40 pt-[31px] px-[16px] pb-[18px] shadow-[0_-8px_28px_rgba(0,0,0,0.12)] transition-transform duration-[240ms] ${
        open ? "translate-y-0" : "translate-y-[105%]"
      }`}
      aria-label="Cart preview"
    >
      {/* 손잡이 */}
      <div className="absolute w-[41px] h-[4px] rounded-full bg-[#111] opacity-[0.16] left-1/2 top-[9px] -translate-x-1/2" />
      <button
        type="button"
        className="absolute right-[15px] top-[8px] text-[24px] bg-transparent"
        onClick={onClose}
        aria-label="Close cart"
      >
        <i className="ph ph-x" />
      </button>

      {/* 상품 정보 — home.css .cart-product */}
      <div className="grid grid-cols-[116px_1fr] gap-[14px] items-start pb-[20px]">
        <div className="w-[116px] h-[114px] rounded-[5px] overflow-hidden bg-[#F7F7F7] flex-shrink-0">
          {item && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageSrc}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <div className="flex items-center gap-[10px] text-[16px] font-semibold mb-[15px]">
            <i className="ph-fill ph-check-circle text-[#3AAE92] text-[24px]" />
            <span>Added to your cart!</span>
          </div>
          <div className="text-[14px] leading-[19px] mb-[11px]">
            {item?.name ?? ""}
          </div>
          <div className="flex items-center gap-[8px] text-[12px]">
            <span>Qty 1</span>
            <span>{item?.price ?? ""}</span>
            {item?.discount && (
              <span className="text-[#E5484D] font-semibold">
                {item.discount}
              </span>
            )}
            {item?.originalPrice && (
              <span className="text-[#CCCCCC] line-through">
                {item.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 합계 + 액션 버튼 */}
      <div className="border-t border-[#E5E5E5] pt-[10px]">
        <div className="flex justify-between items-center px-[5px] pb-[15px] text-[14px]">
          <span>
            Cart <span>({String(count).padStart(2, "0")} items)</span>
          </span>
          <strong className="flex items-center gap-1">
            {item?.price ?? ""} <i className="ph ph-caret-right" />
          </strong>
        </div>
        <div className="grid grid-cols-2 gap-[11px]">
          <button
            type="button"
            className="h-[41px] rounded-[5px] border border-[#3AAE92] bg-[#3AAE92] text-white flex items-center justify-center text-[14px] font-semibold"
            onClick={onViewCart}
          >
            View Cart
          </button>
          <button
            type="button"
            className="h-[41px] rounded-[5px] border border-[#3AAE92] flex items-center justify-center text-[14px] font-semibold"
            onClick={onClose}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </aside>
  );
}
