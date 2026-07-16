"use client";

// ProductCard.tsx — 재사용 가능한 상품 카드
//
// TopSellingSection뿐 아니라 검색 결과, 위시리스트, 추천 상품 등
// 어느 섹션에서든 ProductItem을 받아 동일한 카드로 표시한다.
// home.css .product-card / .product-media / .add-cart / .heart-btn

import Image from "next/image";
import { type ProductItem } from "./home-data";

interface ProductCardProps {
  product: ProductItem;
  wishlisted?: boolean;
  onWishlist?: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({
  product,
  wishlisted = false,
  onWishlist,
  onAddToCart,
}: ProductCardProps) {
  return (
    <article className="min-w-0">
      {/* 이미지 영역 — home.css .product-media: h-119px, bg-card */}
      <div className="h-[119px] rounded-[5px] overflow-hidden relative bg-[#F7F7F7]">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover"
        />
        {onWishlist && (
          <button
            type="button"
            className={`absolute top-[8px] right-[8px] w-[24px] h-[24px] flex items-center justify-center bg-transparent text-[22px] ${
              wishlisted ? "text-[#E5484D]" : "text-black"
            }`}
            onClick={onWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <i className={wishlisted ? "ph-fill ph-heart" : "ph ph-heart"} />
          </button>
        )}
      </div>

      {/* 상품명 — min-h-[40px]로 2줄 이름도 카드 높이 일정하게 유지 */}
      <h3 className="text-[14px] font-normal leading-[20px] min-h-[40px] mt-[7px]">
        {product.name}
      </h3>

      {/* 가격 */}
      <div className="text-[14px] leading-[20px] mt-[2px]">{product.price}</div>

      {/* 별점 — home.css .rating / .stars */}
      <div className="h-[27px] flex items-center gap-[8px]">
        <span className="flex gap-[2px] text-[#5CC1A6] text-[13px]">
          {Array.from({ length: product.rating }, (_, i) => (
            <i key={i} className="ph-fill ph-star" />
          ))}
        </span>
        <span className="text-[14px]">{product.rating}</span>
      </div>

      {/* Add to Cart — home.css .add-cart */}
      {onAddToCart && (
        <button
          type="button"
          className="w-full h-[29px] rounded-[5px] bg-[#3AAE92] text-white flex items-center justify-center gap-[6px] text-[14px] mt-[2px]"
          onClick={onAddToCart}
        >
          <i className="ph ph-shopping-bag" /> Add to Cart
        </button>
      )}
    </article>
  );
}
