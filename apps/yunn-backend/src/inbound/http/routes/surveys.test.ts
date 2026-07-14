import request from "supertest";
import { createApp } from "../../../app.js";

describe("POST /surveys", () => {
  const app = createApp();

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
});
