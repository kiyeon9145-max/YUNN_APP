// step-data.ts — 설문 각 스텝의 질문·선택지 데이터
//
// 값은 반드시 js/domain/SurveyAnswer.js 및 pages/survey.html의 option value와 동일하게 유지한다.
// ResultService, AnalyticsService가 이 값을 키로 사용하기 때문에 임의로 변경하지 않는다.
//
// 구현된 스텝 데이터만 export한다. 스텝 추가 시 이 파일에만 추가하면 된다.

import type { OptionGroup } from "./components/survey-component";
import type { ImageOptionItem } from "./components/image-survey-component";

// ── Step 2: 지역 (도시) ────────────────────────────────────────────────────
// 기후(습도·자외선·건조도)가 크게 갈리는 5개 주요 도시만 라디오로 두고, 나머지는 Other로 직접 입력받는다.
// 추후 기후 기반 루틴 분기, 관리자 대시보드의 지역별 수요 집계가 이 값을 키로 쓴다.
export const STEP2_CITY_OPTIONS: string[] = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
];

// ── Step 1: 성별 + 연령 ────────────────────────────────────────────────────
export const STEP1_GROUPS: OptionGroup[] = [
  {
    name: "gender",
    question: "What's your gender?",
    options: [
      { value: "Female", label: "Female" },
      { value: "Male", label: "Male" },
      { value: "Prefer not to say", label: "Prefer not to say" },
    ],
  },
  {
    name: "age",
    question: "How old are you?",
    options: [
      { value: "18-24", label: "18 - 24" },
      { value: "25-34", label: "25 - 34" },
      { value: "35-44", label: "35 - 44" },
      { value: "45-54", label: "45 - 54" },
      { value: "55+", label: "55+" },
    ],
  },
];

// ── Step 3: 피부 타입 이미지 카드 ──────────────────────────────────────────
export const STEP3_IMAGE_OPTIONS: ImageOptionItem[] = [
  {
    value: "Oily",
    title: "Oily Skin",
    description: "Shiny face, visible pores, gets greasy easily",
    imageSrc: "/images/oily skin.png",
    imageAlt: "Oily Skin",
    variant: "image",
  },
  {
    value: "Dry",
    title: "Dry Skin",
    description: "Feels tight, flaky or rough, looks dull",
    imageSrc: "/images/Dry skin.png",
    imageAlt: "Dry Skin",
    variant: "image",
  },
  {
    value: "Combination",
    title: "Combination Skin",
    description: "Oily in the T-zone, dry or normal on cheeks",
    imageSrc: "/images/combination skin .png",
    imageAlt: "Combination Skin",
    variant: "image",
  },
  {
    value: "Normal",
    title: "Normal Skin",
    description: "Balanced — not too oily, not too dry",
    imageSrc: "/images/normal skin.png",
    imageAlt: "Normal Skin",
    variant: "image",
  },
  {
    value: "NotSure",
    title: "Not sure",
    description: "We'll help you figure it out",
    variant: "not-sure",
  },
];

export type SkinHelperStepId = "3-1" | "3-2" | "3-3" | "3-4";

export const SKIN_INFERENCE_RULES = {
  DRY_MAX: 1.8,
  OILY_MIN: 4.2,
  COMBINATION_MIN: 2.6,
  T_ZONE_VALUE: 3,
};

// ── Step 3 helper: Not sure 선택 시 피부 타입 추론 질문 ─────────────────────
export const STEP3_HELPER_STEPS: Record<
  SkinHelperStepId,
  {
    title: string;
    subtitle: string;
    groups: OptionGroup[];
  }
> = {
  "3-1": {
    title: "Right after cleansing, how does your skin feel?",
    subtitle:
      "Choose the option that best describes the condition of your skin right after cleansing.",
    groups: [
      {
        name: "skinHelperCleanse",
        options: [
          { value: "1", label: "Not tight at all" },
          { value: "2", label: "Barely tight" },
          { value: "3", label: "Slightly tight" },
          { value: "4", label: "Quite tight" },
          { value: "5", label: "Very tight and uncomfortable" },
        ],
      },
    ],
  },
  "3-2": {
    title: "A few hours after cleansing, what happens to your skin?",
    subtitle:
      "Choose the option that best describes your skin after 2-3 hours.",
    groups: [
      {
        name: "skinHelperAfterHours",
        options: [
          { value: "1", label: "Still feels dry or tight" },
          { value: "2", label: "Still feels comfortable" },
          { value: "3", label: "Becomes a bit oily in the T-zone" },
          { value: "4", label: "Becomes oily in most areas" },
          { value: "5", label: "Becomes very oily all over" },
        ],
      },
    ],
  },
  "3-3": {
    title: "How does your skin behave during the day?",
    subtitle:
      "Choose the option that best describes your skin throughout the day.",
    groups: [
      {
        name: "skinHelperDay",
        options: [
          {
            value: "1",
            label: "Feels dry and tight, makeup flakes or looks patchy",
          },
          {
            value: "2",
            label: "Stays comfortable and balanced throughout the day",
          },
          {
            value: "3",
            label: "Gets shiny in the T-Zone but cheeks feel normal",
          },
          { value: "4", label: "Gets shiny in most areas" },
          {
            value: "5",
            label: "Gets very oily all over and needs blotting often",
          },
        ],
      },
    ],
  },
  "3-4": {
    title: "Which description matches your skin best?",
    subtitle: "This helps us understand your pores and texture better.",
    groups: [
      {
        name: "skinHelperTexture",
        options: [
          { value: "1", label: "Small pores, flaky or rough texture" },
          { value: "2", label: "Smooth texture, pores are barely visible" },
          { value: "3", label: "Somewhat visible pores mainly in the T-zone" },
          {
            value: "4",
            label: "Visible pores in most areas and uneven texture",
          },
          { value: "5", label: "Large pores, oily texture with uneven skin" },
        ],
      },
    ],
  },
};

// ── Step 4: 주요 피부 고민 이미지 카드 ─────────────────────────────────────
export const STEP4_IMAGE_OPTIONS: ImageOptionItem[] = [
  {
    value: "Acne",
    title: "Acne / Breakouts",
    description: "Active pimples, redness, inflamed bumps",
    imageSrc: "/images/Acne : Breaksout .png",
    imageAlt: "Acne and breakouts",
    variant: "image",
  },
  {
    value: "Acne marks",
    title: "Acne Marks",
    description: "Dark spots or marks left after breakouts",
    imageSrc: "/images/Acne Marks.png",
    imageAlt: "Acne marks",
    variant: "image",
  },
  {
    value: "Pigmentation",
    title: "Pigmentation / Dark Spots",
    description: "Brown spots, sun spots, or hyperpigmentation",
    imageSrc: "/images/Pigmentation : Dark Spots.png",
    imageAlt: "Pigmentation and dark spots",
    variant: "image",
  },
  {
    value: "Uneven skin tone",
    title: "Uneven Skin Tone",
    description: "Dullness, blotchiness, uneven or patchy skin tone",
    imageSrc: "/images/Uneven_skin_tone.png",
    imageAlt: "Uneven skin tone",
    variant: "image",
  },
];

// ── Step 5: 피부 악화 트리거 ───────────────────────────────────────────────
export const STEP5_GROUPS: OptionGroup[] = [
  {
    name: "trigger",
    question: "Select all that apply.",
    type: "checkbox",
    options: [
      { value: "Sun", label: "After sun exposure" },
      { value: "Stress", label: "During stressful periods" },
      { value: "Period", label: "Around my period" },
      { value: "Sleep", label: "When I don't sleep enough" },
      { value: "New skincare", label: "After trying new skincare" },
      { value: "Same", label: "It stays the same most of the time" },
    ],
  },
];

// ── Step 6: 피부 민감도 ───────────────────────────────────────────────────
export const STEP6_GROUPS: OptionGroup[] = [
  {
    name: "sensitivity",
    question: "Choose the closest one.",
    options: [
      { value: "Rarely", label: "Rarely reacts" },
      { value: "Sometimes", label: "Sometimes gets irritated" },
      { value: "Easily", label: "Reacts easily" },
      { value: "Very sensitive", label: "Very sensitive to products" },
    ],
  },
];

// ── Step 7: 외출 시간 + 선크림 사용 ───────────────────────────────────────
export const STEP7_GROUPS: OptionGroup[] = [
  {
    name: "outdoor",
    question: "How much time do you spend outdoors?",
    options: [
      { value: "Mostly indoors", label: "Mostly indoors" },
      { value: "Under 1h", label: "Under 1 hour" },
      { value: "1-3h", label: "1-3 hours" },
      { value: "3h+", label: "More than 3 hours" },
    ],
  },
  {
    name: "sunscreen",
    question: "How often do you apply sunscreen?",
    options: [
      { value: "Every day", label: "Every day" },
      { value: "Most days", label: "Most days" },
      { value: "Occasionally", label: "Occasionally" },
      { value: "Rarely", label: "Rarely or never" },
    ],
  },
];

// ── Step 8: 수면 + 스트레스 ───────────────────────────────────────────────
export const STEP8_GROUPS: OptionGroup[] = [
  {
    name: "sleep",
    question: "How much sleep do you usually get?",
    options: [
      { value: "Under 5h", label: "Under 5 hours" },
      { value: "5-6h", label: "5-6 hours" },
      { value: "7-8h", label: "7-8 hours" },
      { value: "8h+", label: "More than 8 hours" },
    ],
  },
  {
    name: "stress",
    question: "How would you describe your stress level?",
    options: [
      { value: "Very high", label: "Very high" },
      { value: "High", label: "High" },
      { value: "Manageable", label: "Manageable" },
      { value: "Low", label: "Low" },
    ],
  },
];

// ── Step 9: 현재 루틴 수준 ────────────────────────────────────────────────
export const STEP9_GROUPS: OptionGroup[] = [
  {
    name: "routineLevel",
    question: "Choose your current routine level.",
    options: [
      { value: "Nothing", label: "Nothing — I don't have one" },
      { value: "Wash only", label: "I wash my face, that's it" },
      { value: "Basic", label: "A basic routine (1-2 products)" },
      { value: "Multi", label: "A multi-step routine (3+ products)" },
    ],
  },
];
