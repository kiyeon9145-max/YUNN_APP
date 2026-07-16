import { beforeEach, describe, expect, it, vi } from "vitest";

// jsdom 환경에서 analytics의 localStorage 저장 흐름을 검증하기 위한 테스트 대역이다.
function createLocalStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe("analytics tracking", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.defineProperty(window, "localStorage", {
      value: createLocalStorageMock(),
      configurable: true,
    });
    window.localStorage.clear();
    window.dataLayer = [];
    document.title = "YUNN Test";
    window.history.pushState(
      {},
      "",
      "/survey?utm_source=meta&utm_campaign=launch",
    );
  });

  // 첫 이벤트가 앱 식별자, 페이지 맥락, session_start를 함께 남기는지 확인한다.
  it("adds React app context and writes to dataLayer/localStorage", async () => {
    const { trackEvent } = await import("./analytics");

    const payload = trackEvent("survey_start", { step: "intro" });

    expect(payload).toMatchObject({
      event: "survey_start",
      app_source: "next",
      app_name: "yunn-mobile-react",
      app_version: "0.1.0",
      page_path: "/survey",
      page_title: "YUNN Test",
      step: "intro",
      utm_source: "meta",
      utm_campaign: "launch",
    });
    expect(payload?.session_id).toMatch(/^yunn_/);
    expect(payload?.event_id).toMatch(/^yunn_survey_start_/);

    expect(window.dataLayer).toHaveLength(2);
    expect(window.dataLayer[0]).toMatchObject({
      event: "session_start",
      app_source: "next",
    });
    expect(window.dataLayer[1]).toMatchObject({
      event: "survey_start",
      app_source: "next",
    });

    const stored = JSON.parse(
      window.localStorage.getItem("yunn_analytics_events") || "[]",
    );
    expect(stored).toHaveLength(2);
    expect(stored[1]).toMatchObject({
      event: "survey_start",
      app_source: "next",
      page_path: "/survey",
    });
  });
});
