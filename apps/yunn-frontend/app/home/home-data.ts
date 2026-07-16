// home-data.ts — 홈 화면 정적 데이터
//
// 카테고리·상품 목록을 여기서만 관리한다.
// 항목 추가/수정 시 이 파일만 편집하면 CategorySection·TopSellingSection에 자동 반영된다.

export interface User {
  nickname: string;
}

// 카트에 담긴 단일 항목 (MVP: 세션 내 단일 상품)
export interface CartItem {
  name: string;
  imageSrc: string;
  price: string;
  originalPrice: string;
  discount: string;
}

export interface CategoryItem {
  label: string;
  imageSrc: string;
  isNew?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  imageSrc: string;
  rating: number;
  ratingCount?: number;
}

// ── 카테고리 ─────────────────────────────────────────────────────────────────
// 항목 추가 시 배열에 객체 하나 추가. grid-cols-4 기준, 4의 배수가 자연스럽다.

export const CATEGORIES: CategoryItem[] = [
  { label: "Facewash", imageSrc: "/images/Facewash_YUNN_nobg.png" },
  { label: "Serum", imageSrc: "/images/Serum_top_selling_nobg.png" },
  {
    label: "Moisturiser",
    imageSrc: "/images/Moisturiser_top_selling_nobg.png",
    isNew: true,
  },
  {
    label: "Sunscreen",
    imageSrc: "/images/Sunscreen_YUNN_nobg.png",
    isNew: true,
  },
  { label: "Toner", imageSrc: "/images/Toner_YUNN_nobg.png" },
  { label: "Mask", imageSrc: "/images/Mask_YUNN_nobg.png" },
  { label: "Women", imageSrc: "/images/Woman_model_YUNN_nobg.png" },
  { label: "Men", imageSrc: "/images/Man_model_YUNN_nobg.png" },
];

// ── 인기 상품 ─────────────────────────────────────────────────────────────────
// 상품 추가 시 배열에 객체 하나 추가. grid-cols-3 기준으로 렌더링된다.

export const TOP_SELLING: ProductItem[] = [
  {
    id: "glow-serum",
    name: "YUNN Glow Serum",
    price: "₹ 1,499",
    originalPrice: "₹ 2,000",
    discount: "25%",
    imageSrc: "/images/Serum_top_selling.png",
    rating: 5,
  },
  {
    id: "mattee-sunscreen",
    name: "YUNN Mattee Sunscreen",
    price: "₹ 899",
    originalPrice: "₹ 1,299",
    discount: "31%",
    imageSrc: "/images/Facewash_top_selling.png",
    rating: 5,
  },
  {
    id: "hydrating-moisturiser",
    name: "YUNN Hydrating Moisturiser",
    price: "₹ 1,299",
    originalPrice: "₹ 1,799",
    discount: "28%",
    imageSrc: "/images/Moisturiser_top_selling.png",
    rating: 5,
  },
];
