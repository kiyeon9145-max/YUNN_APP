"use client";

// use-page-tracking.ts — page_view/page_exit + 체류시간(duration_sec) 트래킹 훅
//
// 기획문서 1.2, 2-4 기준: page_view는 화면 진입 시, page_exit는 다음 page_view
// 또는 세션 종료 시점에 duration_sec·exit_type(converted/dropped)과 함께 전송한다.
// 마지막 페이지 체류시간 유실을 막기 위해 visibilitychange/beforeunload에서도
// page_exit를 전송한다(beacon 경로는 analytics.ts의 sendBeacon이 담당).

import { useEffect, useRef } from "react";
import { trackYunnEvent, type PageId } from "./analytics";

export function usePageTracking(pageId: PageId | null) {
  const enteredAtRef = useRef(0);
  const exitTypeRef = useRef<"converted" | "dropped">("dropped");
  const firedRef = useRef(false);

  useEffect(() => {
    if (!pageId) return;

    enteredAtRef.current = performance.now();
    exitTypeRef.current = "dropped";
    firedRef.current = false;
    trackYunnEvent("page_view", { page_id: pageId });

    const sendExit = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      const duration_sec =
        Math.round((performance.now() - enteredAtRef.current) / 100) / 10;
      trackYunnEvent("page_exit", {
        page_id: pageId,
        duration_sec,
        exit_type: exitTypeRef.current,
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") sendExit();
    };

    window.addEventListener("beforeunload", sendExit);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      sendExit();
      window.removeEventListener("beforeunload", sendExit);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pageId]);

  const markConverted = () => {
    exitTypeRef.current = "converted";
  };

  return { markConverted };
}
