import { describe, expect, it } from "vitest";
import { buildSheetUrl } from "./sheet-repository";

describe("sheet repository", () => {
  it("serializes payload values for Apps Script doGet", () => {
    const url = buildSheetUrl(
      {
        app_source: "next",
        trigger: ["stress", "sun"],
        photo_uploaded: false,
        empty_value: undefined,
      },
      "https://example.com/exec",
    );

    expect(url).toBe(
      "https://example.com/exec?app_source=next&trigger=stress%2Csun&photo_uploaded=false&empty_value=",
    );
  });
});
