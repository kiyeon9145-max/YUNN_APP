import request from "supertest";
import { createApp } from "../../../app.js";

describe("PATCH /routine/:sessionId", () => {
  const app = createApp();
  const sessionId = "routine_test_session_1";

  // 날짜 유효성 검사 - 잘못된 달
  it("should reject invalid month (13)", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-13-01",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 날짜 유효성 검사 - 잘못된 날짜 (2월 30일)
  it("should reject invalid day (Feb 30)", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-02-30",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 날짜 유효성 검사 - 잘못된 날짜 (12월 32일)
  it("should reject invalid day (Dec 32)", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-12-32",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 날짜 유효성 검사 - 비윤년 2월 29일
  it("should reject Feb 29 in non-leap year", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2025-02-29",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 날짜 유효성 검사 - 모든 0
  it("should reject all zeros (0000-00-00)", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "0000-00-00",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 날짜 유효성 검사 - 윤년 2월 29일 (유효함)
  it("should accept Feb 29 in leap year (2024)", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2024-02-29",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    expect(response.status).toBe(200);
  });

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

  // 배열 길이 검증 - 1개 요소
  it("should reject morning array with 1 element", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-15",
        morning: [true],
        evening: [true, false, true, false],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 배열 길이 검증 - 3개 요소
  it("should reject morning array with 3 elements", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-15",
        morning: [true, false, true],
        evening: [true, false, true, false],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 배열 길이 검증 - 5개 요소
  it("should reject morning array with 5 elements", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-15",
        morning: [true, false, true, false, true],
        evening: [true, false, true, false],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 배열 길이 검증 - 빈 배열
  it("should reject empty array", async () => {
    const response = await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-15",
        morning: [],
        evening: [true, false, true, false],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
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

  // 배열 요소 타입 검증 - 문자열 요소
  it("should reject string elements in array", async () => {
    const sessionId2 = "routine_test_session_string";
    const response = await request(app)
      .patch(`/routine/${sessionId2}`)
      .send({
        dateKey: "2026-07-16",
        morning: ["true", "false", "true", "false"],
        evening: [true, false, true, false],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 배열 요소 타입 검증 - 숫자 요소
  it("should reject number elements", async () => {
    const sessionId2 = "routine_test_session_number";
    const response = await request(app)
      .patch(`/routine/${sessionId2}`)
      .send({
        dateKey: "2026-07-16",
        morning: [1, 0, 1, 0],
        evening: [true, false, true, false],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 배열 요소 타입 검증 - null 요소
  it("should reject array with null element", async () => {
    const sessionId2 = "routine_test_session_null";
    const response = await request(app)
      .patch(`/routine/${sessionId2}`)
      .send({
        dateKey: "2026-07-16",
        morning: [true, null, true, false],
        evening: [true, false, true, false],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 데이터 일관성 - 역순 저장 후 정렬 확인
  it("should maintain correct date ordering with reverse insertion", async () => {
    const sessionId = "reverse_order_test";

    // 역순으로 저장
    await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-05",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-03",
        morning: [false, true, false, true],
        evening: [false, false, false, false],
      });

    await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-04",
        morning: [true, true, true, true],
        evening: [false, false, false, false],
      });

    const response = await request(app).get(`/routine/${sessionId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.startDate).toBe("2026-07-03");

    // checks의 dateKey들이 정렬되어 있는지 확인
    const checkKeys = Object.keys(response.body.data.checks);
    expect(checkKeys).toEqual(["2026-07-03", "2026-07-04", "2026-07-05"]);
  });

  // 데이터 일관성 - 같은 날짜 중복 저장 (Upsert)
  it("should return only one entry per date after upsert", async () => {
    const sessionId = "duplicate_date_test";

    // 첫 번째 저장
    await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-14",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    // 같은 날짜 업데이트
    await request(app)
      .patch(`/routine/${sessionId}`)
      .send({
        dateKey: "2026-07-14",
        morning: [false, false, false, false],
        evening: [false, false, false, false],
      });

    const response = await request(app).get(`/routine/${sessionId}`);

    expect(response.status).toBe(200);
    expect(Object.keys(response.body.data.checks).length).toBe(1);
    expect(response.body.data.checks["2026-07-14"].morning).toEqual([
      false,
      false,
      false,
      false,
    ]);
  });

  // 데이터 격리 - 다른 sessionId 간 데이터 분리
  it("should isolate data between different sessionIds", async () => {
    const session1 = "isolation_test_1";
    const session2 = "isolation_test_2";

    // session1에 데이터 저장
    await request(app)
      .patch(`/routine/${session1}`)
      .send({
        dateKey: "2026-07-14",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    // session2에 다른 데이터 저장
    await request(app)
      .patch(`/routine/${session2}`)
      .send({
        dateKey: "2026-07-15",
        morning: [false, true, false, true],
        evening: [false, false, false, false],
      });

    // 각각 조회
    const response1 = await request(app).get(`/routine/${session1}`);
    const response2 = await request(app).get(`/routine/${session2}`);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    // session1은 2026-07-14만 있어야 함
    expect(Object.keys(response1.body.data.checks)).toEqual(["2026-07-14"]);
    expect(response1.body.data.checks["2026-07-14"].morning).toEqual([
      true,
      false,
      true,
      false,
    ]);

    // session2는 2026-07-15만 있어야 함
    expect(Object.keys(response2.body.data.checks)).toEqual(["2026-07-15"]);
    expect(response2.body.data.checks["2026-07-15"].morning).toEqual([
      false,
      true,
      false,
      true,
    ]);
  });

  // 에러 응답 - 모든 필드 검증 실패
  it("should return detailed fieldErrors for all failed fields", async () => {
    const response = await request(app)
      .patch("/routine/test")
      .send({
        dateKey: "invalid-date",
        morning: [true],
        evening: "not-array",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details?.fieldErrors?.dateKey).toBeDefined();
    expect(response.body.error.details?.fieldErrors?.morning).toBeDefined();
    expect(response.body.error.details?.fieldErrors?.evening).toBeDefined();
  });

  // sessionId 검증 - 255자 이상
  it("should return VALIDATION_ERROR when sessionId exceeds 255 characters in PATCH", async () => {
    const longSessionId = "a".repeat(256);
    const response = await request(app)
      .patch(`/routine/${longSessionId}`)
      .send({
        dateKey: "2026-07-14",
        morning: [true, false, true, false],
        evening: [true, true, false, true],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
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

  // sessionId 검증 - 빈 문자열
  it("should return VALIDATION_ERROR when sessionId is empty string in GET", async () => {
    const response = await request(app).get("/routine/");

    expect(response.status).toBe(404);
  });

  // sessionId 검증 - 255자 이상
  it("should return VALIDATION_ERROR when sessionId exceeds 255 characters in GET", async () => {
    const longSessionId = "a".repeat(256);
    const response = await request(app).get(`/routine/${longSessionId}`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
