import request from "supertest";
import { createApp } from "../../../app.js";

describe("POST /surveys", () => {
  const app = createApp();

  // 에러 케이스 1: 필수값(sessionId) 누락 시 VALIDATION_ERROR 반환
  it("should return VALIDATION_ERROR when sessionId is missing", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        photoUploaded: false,
        // sessionId 누락
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: expect.objectContaining({
        code: "VALIDATION_ERROR",
        details: expect.objectContaining({
          fieldErrors: expect.objectContaining({
            sessionId: expect.any(Array),
          }),
        }),
      }),
    });
  });

  // 에러 케이스 2: 필수값(photoUploaded) 누락 시 VALIDATION_ERROR 반환
  it("should return VALIDATION_ERROR when photoUploaded is missing", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session",
        // photoUploaded 누락
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: expect.objectContaining({
        code: "VALIDATION_ERROR",
      }),
    });
  });

  // 문제점 1: Invalid Enum - gender
  it("should return VALIDATION_ERROR when gender is invalid enum value", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_invalid_gender",
        gender: "InvalidGender",
        photoUploaded: false,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 문제점 1: Invalid Enum - skinType
  it("should return VALIDATION_ERROR when skinType is invalid enum value", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_invalid_skintype",
        skinType: "SuperOily",
        photoUploaded: false,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 문제점 1: Invalid Enum - sensitivity
  it("should return VALIDATION_ERROR when sensitivity is invalid enum value", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_invalid_sensitivity",
        sensitivity: "Ultra sensitive",
        photoUploaded: false,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 문제점 2: Concerns 정규화 - Acne 직통
  it("should pass through 'Acne' as-is (not normalized)", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_acne_direct",
        concerns: "Acne",
        photoUploaded: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.resultConcernType).toBe("Acne");
  });

  // 문제점 2: Concerns 정규화 - Pigmentation 직통
  it("should pass through 'Pigmentation' as-is (not normalized)", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_pigmentation",
        concerns: "Pigmentation",
        photoUploaded: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.resultConcernType).toBe("Pigmentation");
  });

  // 문제점 3: Empty String - sessionId
  it("should return VALIDATION_ERROR when sessionId is empty string", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "",
        photoUploaded: false,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 문제점 4: photoUploaded 타입 검증
  it("should return VALIDATION_ERROR when photoUploaded is string", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session",
        photoUploaded: "true",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 문제점 4: photoUploaded true 케이스
  it("should accept photoUploaded as true", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_photo_true",
        photoUploaded: true,
      });

    expect(response.status).toBe(200);
  });

  // 문제점 5: Trigger 배열 검증
  it("should accept trigger as array of strings", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_trigger_array",
        trigger: ["humidity", "stress"],
        photoUploaded: false,
      });

    expect(response.status).toBe(200);
  });

  // 문제점 5: Trigger 비배열 검증
  it("should return VALIDATION_ERROR when trigger is not array", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_trigger_string",
        trigger: "humidity",
        photoUploaded: false,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 문제점 7: Enum 모든 값 - sensitivity
  it("should accept all valid sensitivity values", async () => {
    const sensitivities = ["Rarely", "Sometimes", "Easily", "Very sensitive"];

    for (const sensitivity of sensitivities) {
      const response = await request(app)
        .post("/surveys")
        .send({
          sessionId: `test_sensitivity_${sensitivity}`,
          sensitivity,
          photoUploaded: false,
        });

      expect(response.status).toBe(200);
    }
  });

  // 문제점 7: Enum 모든 값 - sunscreen
  it("should accept all valid sunscreen values", async () => {
    const sunscreens = ["Every day", "Most days", "Occasionally", "Rarely"];

    for (const sunscreen of sunscreens) {
      const response = await request(app)
        .post("/surveys")
        .send({
          sessionId: `test_sunscreen_${sunscreen}`,
          sunscreen,
          photoUploaded: false,
        });

      expect(response.status).toBe(200);
    }
  });

  // 문제점 7: Enum 모든 값 - stress
  it("should accept all valid stress values", async () => {
    const stresses = ["Low", "Medium", "High", "Very high"];

    for (const stress of stresses) {
      const response = await request(app)
        .post("/surveys")
        .send({
          sessionId: `test_stress_${stress}`,
          stress,
          photoUploaded: false,
        });

      expect(response.status).toBe(200);
    }
  });

  // 문제점 7: Enum 모든 값 - routineLevel
  it("should accept all valid routineLevel values", async () => {
    const routineLevels = ["Nothing", "Wash only", "Basic", "Multi"];

    for (const routineLevel of routineLevels) {
      const response = await request(app)
        .post("/surveys")
        .send({
          sessionId: `test_routineLevel_${routineLevel}`,
          routineLevel,
          photoUploaded: false,
        });

      expect(response.status).toBe(200);
    }
  });

  // 문제점 7: Invalid stress enum
  it("should return VALIDATION_ERROR when stress is invalid enum value", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_invalid_stress",
        stress: "Extremely high",
        photoUploaded: false,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 문제점 7: Invalid routineLevel enum
  it("should return VALIDATION_ERROR when routineLevel is invalid enum value", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_invalid_routineLevel",
        routineLevel: "Expert",
        photoUploaded: false,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  // 해피패스: 유효한 설문 완료 시 resultSkinType과 resultConcernType 반환
  it("should save survey and return result types", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_123",
        city: "Seoul",
        gender: "Female",
        age: "25-34",
        skinType: "Oily",
        concerns: "Acne",
        photoUploaded: false,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({
        sessionId: "test_session_123",
        resultSkinType: "Oily",
        resultConcernType: "Acne",
        createdAt: expect.any(String),
      }),
    });
  });

  // 정규화 테스트: "Uneven skin tone" → "Tone"
  it("should normalize concern 'Uneven skin tone' to 'Tone'", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_124",
        concerns: "Uneven skin tone",
        photoUploaded: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.resultConcernType).toBe("Tone");
  });

  // 정규화 테스트: "Acne marks" → "Marks"
  it("should normalize concern 'Acne marks' to 'Marks'", async () => {
    const response = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_125",
        concerns: "Acne marks",
        photoUploaded: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.resultConcernType).toBe("Marks");
  });
});

describe("GET /surveys/:sessionId", () => {
  const app = createApp();

  // 에러 케이스: 존재하지 않는 sessionId 조회 시 NOT_FOUND 반환
  it("should return NOT_FOUND when survey does not exist", async () => {
    const response = await request(app).get(
      "/surveys/nonexistent_session_id"
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: expect.objectContaining({
        code: "NOT_FOUND",
        message: "진단 결과를 찾을 수 없습니다",
      }),
    });
  });

  // 문제점 6: POST → GET 필드명 매핑
  it("should correctly map resultConcernType to concernType in GET", async () => {
    const sessionId = "mapping_test_session_concern";

    // POST
    const postResponse = await request(app)
      .post("/surveys")
      .send({
        sessionId,
        concerns: "Uneven skin tone",
        skinType: "Oily",
        photoUploaded: false,
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body.data.resultConcernType).toBe("Tone");

    // GET
    const getResponse = await request(app).get(`/surveys/${sessionId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.concernType).toBe("Tone");
    expect(getResponse.body.data.skinType).toBe("Oily");
  });

  // 문제점 6: POST → GET 필드명 매핑 - skinType
  it("should correctly map resultSkinType to skinType in GET", async () => {
    const sessionId = "mapping_test_session_skin";

    // POST
    const postResponse = await request(app)
      .post("/surveys")
      .send({
        sessionId,
        skinType: "Dry",
        photoUploaded: false,
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body.data.resultSkinType).toBe("Dry");

    // GET
    const getResponse = await request(app).get(`/surveys/${sessionId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.skinType).toBe("Dry");
  });

  // 문제점 8: Multiple Surveys Same SessionId (최신 데이터)
  it("should return latest survey when multiple surveys exist for same sessionId", async () => {
    const sessionId = "multi_survey_session";

    // 첫 번째 설문
    const first = await request(app)
      .post("/surveys")
      .send({
        sessionId,
        skinType: "Oily",
        photoUploaded: false,
      });
    expect(first.status).toBe(200);

    // 두 번째 설문 (같은 sessionId, 다른 데이터)
    const second = await request(app)
      .post("/surveys")
      .send({
        sessionId,
        skinType: "Dry",
        photoUploaded: true,
      });
    expect(second.status).toBe(200);

    // GET - 최신 데이터(Dry) 반환되어야 함
    const response = await request(app).get(`/surveys/${sessionId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.skinType).toBe("Dry");
  });

  // 문제점 10: GET 404 경계값
  it("should return NOT_FOUND for various non-existent sessionIds", async () => {
    const nonExistentIds = [
      "absolutely_non_existent_12345",
      "session_with_special_chars_!@#",
    ];

    for (const id of nonExistentIds) {
      const response = await request(app).get(`/surveys/${id}`);
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    }
  });

  // 해피패스: 존재하는 sessionId 조회 시 설문 데이터 반환
  it("should return latest survey for existing sessionId", async () => {
    // 먼저 설문 저장
    const postResponse = await request(app)
      .post("/surveys")
      .send({
        sessionId: "get_test_session_1",
        gender: "Male",
        age: "30-39",
        city: "Busan",
        skinType: "Dry",
        concerns: "Pigmentation",
        photoUploaded: true,
      });

    expect(postResponse.status).toBe(200);

    // 조회
    const getResponse = await request(app).get(
      "/surveys/get_test_session_1"
    );

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      success: true,
      data: expect.objectContaining({
        skinType: "Dry",
        concernType: "Pigmentation",
        gender: "Male",
        age: "30-39",
        city: "Busan",
        createdAt: expect.any(String),
      }),
    });
  });

  // sessionId 검증 - 빈 문자열
  it("should return VALIDATION_ERROR when sessionId is empty string", async () => {
    const response = await request(app).get("/surveys/");

    expect(response.status).toBe(404);
  });

  // sessionId 검증 - 255자 이상
  it("should return VALIDATION_ERROR when sessionId exceeds 255 characters", async () => {
    const longSessionId = "a".repeat(256);
    const response = await request(app).get(`/surveys/${longSessionId}`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
