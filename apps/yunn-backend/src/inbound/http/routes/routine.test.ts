import request from "supertest";
import { createApp } from "../../../app.js";

describe("PATCH /routine/:sessionId", () => {
  const app = createApp();
  const sessionId = "routine_test_session_1";

  // 해피패스: 새로운 루틴 저장
  it("should save routine check for new sessionId", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-14",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        dateKey: "2026-07-14",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      },
    });
  });

  // 해피패스: 같은 날짜 업데이트
  it("should update routine check for existing date", async () => {
    const sessionId2 = "routine_test_session_2";

    // 첫 번째 저장
    await request(app)
      .patch(`/routine/${sessionId2}`)
      .send({
        dateKey: "2026-07-14",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    // 업데이트
    const response = await request(app)
      .patch(`/routine/${sessionId2}`)
      .send({
        dateKey: "2026-07-14",
        morning: [false, false, false, false],
        evening: [false, false, false, false],
      });

    expect(response.status).toBe(200);
    expect(response.body.data.morning).toEqual([false, false, false, false]);
  });
});

describe("GET /routine/:sessionId", () => {
  const app = createApp();

  // 해피패스: 루틴 조회
  it("should return routine data with startDate and checks", async () => {
    const sessionId = "routine_test_session_3";

    // 루틴 데이터 저장
    await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-01",
        morning: [true, true, true, true],
        evening: [true, true, true, true],
      });

    // 조회
    const response = await request(app).get(`/routine/${sessionId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({
        startDate: "2026-07-01",
        checks: expect.objectContaining({
          "2026-07-01": {
            morning: [true, true, true, true],
            evening: [true, true, true, true],
          },
        }),
      }),
    });
  });

  // 해피패스: 여러 날짜의 루틴 조회
  it("should return multiple dates of routine checks", async () => {
    const sessionId = "routine_test_session_4";

    // 2개 날짜 저장
    await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-01",
        morning: [true, false, true, false],
        evening: [false, true, false, true],
      });

    await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-02",
        morning: [true, true, true, true],
        evening: [false, false, false, false],
      });

    // 조회
    const response = await request(app).get(`/routine/${sessionId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.checks).toHaveProperty("2026-07-01");
    expect(response.body.data.checks).toHaveProperty("2026-07-02");
    expect(response.body.data.startDate).toBe("2026-07-01");
  });
});
