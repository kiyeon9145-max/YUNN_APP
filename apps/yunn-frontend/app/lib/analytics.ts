"use client";

// analytics.ts — YUNN React 앱 이벤트 트래킹 중앙 모듈
//
// React 앱에서는 모든 이벤트를 이 파일의 trackEvent()/trackYunnEvent()로만 발행한다.
// 공통 앱 식별자와 페이지 컨텍스트를 자동으로 붙여 GTM/GA4에서 레거시 프론트와
// 명확히 구분할 수 있게 한다.
//
// NEXT_PUBLIC_YUNN_ANALYTICS_ENDPOINT를 Vercel 환경변수에 설정하면 sendBeacon 원격
// 전송 경로가 자동으로 활성화된다(코드 변경 불필요).

const SESSION_ID_KEY = "yunn_session_id";
const ANALYTICS_LOG_KEY = "yunn_analytics_events";
const ANALYTICS_LOG_MAX = 1000;

// React 앱 이벤트를 GA4/GTM에서 레거시 프론트와 구분하기 위한 고정 식별자다.
const APP_SOURCE = "next";
const APP_NAME = "yunn-mobile-react";
const APP_VERSION = process.env.NEXT_PUBLIC_YUNN_APP_VERSION || "0.1.0";

// 추후 별도 수집 서버가 생겨도 호출부 변경 없이 켤 수 있게 환경변수로 둔다.
const REMOTE_ANALYTICS_ENDPOINT =
  process.env.NEXT_PUBLIC_YUNN_ANALYTICS_ENDPOINT || "";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

// ── page_id / step 목록 (기획문서 2-3, 3장 기준) ────────────────────────────
export type PageId =
  | "landing"
  | "diagnosis_intro"
  | "routine_am"
  | "routine_pm"
  | "routine_extra"
  | "ingredient_loading"
  | "ingredient_result"
  | "cart"
  | "pricing";

export type RoutineStepId = "am" | "pm" | "extra";

// ── 공통 속성 컨텍스트 (기획문서 2-1) ───────────────────────────────────────
// 이벤트 발생 시점보다 늦게 알게 되는 사용자 맥락을 보관하기 위한 상태다.
interface AnalyticsContext {
  city: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  skin_concern: string | null;
}

// 화면별 이벤트가 자유롭게 추가 데이터를 실어 보낼 수 있게 열어둔 타입이다.
export type AnalyticsEventProperties = Record<string, unknown>;

// GTM/GA4와 localStorage에 항상 같은 모양으로 저장하기 위한 표준 payload다.
export interface AnalyticsEventPayload extends AnalyticsEventProperties {
  event: string;
  event_id: string;
  event_timestamp: string;
  timestamp: string;
  app_source: typeof APP_SOURCE;
  app_name: typeof APP_NAME;
  app_version: string;
  app_env: string;
  session_id: string;
  page_path: string;
  page_url: string;
  page_title: string;
  referrer: string;
  city: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  skin_concern: string | null;
}

let context: AnalyticsContext = {
  city: null,
  utm_source: null,
  utm_campaign: null,
  skin_concern: null,
};
let urlContextRead = false;

// UTM 값은 첫 이벤트에만 한 번 읽어 세션 이벤트들에 계속 붙인다.
function readUtmFromUrlOnce() {
  if (urlContextRead || typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  context.utm_source = params.get("utm_source") ?? context.utm_source;
  context.utm_campaign = params.get("utm_campaign") ?? context.utm_campaign;
  urlContextRead = true;
}

// city/skin_concern처럼 진단 완료 후에만 채워지는 값은 알게 되는 시점에 이걸로 갱신한다.
export function setAnalyticsContext(partial: Partial<AnalyticsContext>) {
  context = { ...context, ...partial };
}

// ── session_id (레거시 SessionRepository.getSessionId와 동일 정책) ─────────
// localStorage에 최초 1회 생성 후 영구 재사용 — 재방문해도 재생성하지 않는다.
function ensureSessionId(): { id: string; isNew: boolean } {
  if (typeof window === "undefined") return { id: "", isNew: false };
  let id = window.localStorage.getItem(SESSION_ID_KEY);
  let isNew = false;
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `yunn_${crypto.randomUUID()}`
        : `yunn_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(SESSION_ID_KEY, id);
    isNew = true;
  }
  return { id, isNew };
}

export function getSessionId(): string {
  return ensureSessionId().id;
}

// 네트워크 전송이 실패해도 로컬에서 이벤트를 확인할 수 있게 최근 로그를 보관한다.
function persistLog(payload: Record<string, unknown>) {
  try {
    const raw = window.localStorage.getItem(ANALYTICS_LOG_KEY);
    const events = raw ? JSON.parse(raw) : [];
    events.push(payload);
    window.localStorage.setItem(
      ANALYTICS_LOG_KEY,
      JSON.stringify(events.slice(-ANALYTICS_LOG_MAX)),
    );
  } catch {
    // 분석 로그 저장은 best-effort — 절대 사용자 흐름을 막지 않는다.
  }
}

// 이벤트 중복 제거와 디버깅 추적을 위해 각 발행마다 고유 ID를 만든다.
function createEventId(eventName: string) {
  const suffix =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `yunn_${eventName}_${suffix}`;
}

// 화면 이동 분석에 필요한 현재 브라우저 페이지 정보를 payload에 붙인다.
function getPageContext() {
  if (typeof window === "undefined") {
    return {
      page_path: "",
      page_url: "",
      page_title: "",
      referrer: "",
    };
  }

  return {
    page_path: window.location.pathname,
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
  };
}

// 하나의 이벤트를 localStorage, GTM dataLayer, 원격 endpoint, CustomEvent로 동시에 발행한다.
function emit(
  eventName: string,
  sessionId: string,
  properties: AnalyticsEventProperties,
) {
  const eventTimestamp = new Date().toISOString();
  const payload: AnalyticsEventPayload = {
    ...properties,
    event: eventName,
    event_id: createEventId(eventName),
    event_timestamp: eventTimestamp,
    timestamp: eventTimestamp,
    app_source: APP_SOURCE,
    app_name: APP_NAME,
    app_version: APP_VERSION,
    app_env: process.env.NODE_ENV || "development",
    session_id: sessionId,
    ...getPageContext(),
    city: context.city,
    utm_source: context.utm_source,
    utm_campaign: context.utm_campaign,
    skin_concern: context.skin_concern,
  };

  persistLog(payload);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (REMOTE_ANALYTICS_ENDPOINT && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(REMOTE_ANALYTICS_ENDPOINT, JSON.stringify(payload));
    } catch {
      // 원격 전송은 best-effort.
    }
  }

  window.dispatchEvent(new CustomEvent("yunn:analytics", { detail: payload }));
  return payload;
}

// ── 핵심 이벤트 발행 함수 (모든 트래킹의 진입점) ────────────────────────────
export function trackYunnEvent(
  eventName: string,
  properties: AnalyticsEventProperties = {},
) {
  if (typeof window === "undefined") return null;
  readUtmFromUrlOnce();
  const { id: sessionId, isNew } = ensureSessionId();
  // session_start는 "최초 유입" 시점에만 발행한다 — 새 session_id가 만들어질 때가 바로 그 시점.
  if (isNew) emit("session_start", sessionId, {});
  return emit(eventName, sessionId, properties);
}

// 새 React 코드에서 짧고 명확한 이름으로 호출하기 위한 표준 별칭이다.
export const trackEvent = trackYunnEvent;

// ── 퍼널 핵심 행동 이벤트 (기획문서 2-2, 3장) ───────────────────────────────
// 아래 중 landing/diagnosis_intro/ingredient_loading/ingredient_result/cart/pricing
// 화면은 아직 리액트 앱에 없어 호출부가 없다. 화면이 만들어지면 그대로 가져다 쓰면 된다.

export function trackDiagnosisStart() {
  return trackYunnEvent("diagnosis_start");
}

export function trackRoutineStepComplete(step: RoutineStepId) {
  return trackYunnEvent("routine_step_complete", { step });
}

export function trackCategoryOptionClick(
  category: string,
  step: RoutineStepId,
) {
  return trackYunnEvent("category_option_click", { category, step });
}

export function trackIngredientResultView(mismatchCount: number) {
  return trackYunnEvent("ingredient_result_view", {
    mismatch_count: mismatchCount,
  });
}

export function trackCartClick(sourcePage: PageId) {
  return trackYunnEvent("cart_click", { source_page: sourcePage });
}

export function trackPricingView() {
  return trackYunnEvent("pricing_view");
}

export function trackPricingClick() {
  return trackYunnEvent("pricing_click");
}

export function trackSubscribeComplete(plan: string) {
  return trackYunnEvent("subscribe_complete", { plan });
}

export function trackRediagnosisComplete() {
  return trackYunnEvent("rediagnosis_complete");
}

// ── 루틴 트래킹 이벤트 (routine.html 설계 문서의 이벤트 스키마와 동일) ──────
// trackRoutineStepComplete(위)는 설문 화면(step: am/pm/extra)용 이벤트로 별개다.

export function trackRoutineStarted(
  day: number,
  skinType: string,
  concernType: string,
) {
  return trackYunnEvent("routine_started", { day, skinType, concernType });
}

export function trackRoutineStepChecked(
  day: number,
  period: "morning" | "evening",
  step: number,
  stepName: string,
) {
  return trackYunnEvent("routine_step_checked", { day, period, step, stepName });
}

export function trackMorningCompleted(day: number) {
  return trackYunnEvent("morning_completed", { day });
}

export function trackEveningCompleted(day: number) {
  return trackYunnEvent("evening_completed", { day });
}

export function trackBeforePhotoUploaded() {
  return trackYunnEvent("before_photo_uploaded", { day: 1 });
}

export function trackAfterPhotoUploaded(day: number) {
  return trackYunnEvent("after_photo_uploaded", { day });
}

export function trackCompareViewed(day: number, streakDays: number) {
  return trackYunnEvent("compare_viewed", { day, streakDays });
}
