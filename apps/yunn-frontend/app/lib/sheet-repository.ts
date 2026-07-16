"use client";

// sheet-repository.ts — React 앱의 비식별 설문 완료 데이터를 Google Sheets로 전송한다.

// Apps Script Web App URL은 공개 설정값이지만 환경별 교체를 위해 env에서만 읽는다.
const SHEET_ENDPOINT =
  process.env.NEXT_PUBLIC_YUNN_SHEET_ENDPOINT || "";

export type SheetPayloadValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[];

export type SheetPayload = Record<string, SheetPayloadValue>;

// 배열/빈 값까지 GAS doGet이 읽기 쉬운 쿼리 문자열로 변환한다.
export function buildSheetUrl(payload: SheetPayload, endpoint = SHEET_ENDPOINT) {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      params.set(key, value.join(","));
      return;
    }
    params.set(key, value == null ? "" : String(value));
  });

  return `${endpoint}?${params.toString()}`;
}

// CORS preflight 없이 Apps Script doGet을 호출하기 위해 이미지 픽셀 요청을 사용한다.
export function sendToSheet(payload: SheetPayload) {
  if (typeof window === "undefined" || !SHEET_ENDPOINT) return null;

  try {
    const img = new Image();
    img.src = buildSheetUrl(payload);
    return img.src;
  } catch {
    // Sheets 전송은 운영 로그용이므로 사용자 설문 흐름을 막지 않는다.
    return null;
  }
}
