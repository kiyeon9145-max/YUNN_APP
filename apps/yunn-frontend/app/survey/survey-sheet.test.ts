import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildSurveySheetPayload } from "./survey-sheet";
import type { SurveyAnswers } from "./page";

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

describe("survey sheet payload", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T02:00:00.000Z"));
    Object.defineProperty(window, "localStorage", {
      value: createLocalStorageMock(),
      configurable: true,
    });
    window.history.pushState({}, "", "/survey");
  });

  it("builds a non-PII survey completion row", () => {
    const answers: SurveyAnswers = {
      city: "Delhi",
      gender: "Female",
      age: "25-34",
      skinType: "Oily",
      concerns: "Acne",
      trigger: ["Stress", "Heat"],
      sensitivity: "Medium",
      outdoor: "2-4h",
      sunscreen: "Sometimes",
      sleep: "6-7h",
      stress: "High",
      routineLevel: "Basic",
    };

    const payload = buildSurveySheetPayload(answers, { photoUploaded: false });

    expect(payload).toMatchObject({
      app_source: "next",
      app_name: "yunn-mobile-react",
      completed_at: "2026-07-10T02:00:00.000Z",
      page_path: "/survey",
      city: "Delhi",
      gender: "Female",
      skin_type: "Oily",
      concern: "Acne",
      trigger: ["Stress", "Heat"],
      photo_uploaded: false,
      result_skin_type: "Oily",
      result_concern_type: "Acne",
    });
    expect(payload.session_id).toMatch(/^yunn_/);
    expect(payload).not.toHaveProperty("name");
    expect(payload).not.toHaveProperty("email");
    expect(payload).not.toHaveProperty("phone");
  });
});
