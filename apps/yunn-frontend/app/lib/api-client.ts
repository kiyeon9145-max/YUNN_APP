// YUNN 백엔드 REST API 클라이언트

const API_BASE_URL = process.env.NEXT_PUBLIC_YUNN_API_ENDPOINT || "http://localhost:4000";

// 타입 정의 (백엔드 스키마와 동기화)
export interface SurveySubmitRequest {
  sessionId: string;
  photoUploaded: boolean;
  gender?: string;
  age?: string;
  city?: string;
  skinType?: string;
  concerns?: string;
  trigger?: string[];
  sensitivity?: string;
  outdoor?: string;
  sunscreen?: string;
  sleep?: string;
  stress?: string;
  routineLevel?: string;
  campaign?: string;
}

export interface SurveySubmitResponse {
  success: boolean;
  data: {
    resultSkinType: string;
    resultConcernType: string;
    sessionId: string;
    createdAt: string;
    campaign?: string | null;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface SurveyGetResponse {
  success: boolean;
  data: {
    skinType?: string;
    concernType?: string;
    gender?: string;
    age?: string;
    city?: string;
    photoUploaded: boolean;
    createdAt: string;
    campaign?: string | null;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface RoutineUpdateRequest {
  dateKey: string;
  morning: boolean[];
  evening: boolean[];
}

export interface RoutineUpdateResponse {
  success: boolean;
  data: {
    dateKey: string;
    morning: boolean[];
    evening: boolean[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface RoutineGetResponse {
  success: boolean;
  data: {
    startDate: string;
    checks: Record<string, { morning: boolean[]; evening: boolean[] }>;
  };
  error?: {
    code: string;
    message: string;
  };
}

// 설문 제출
export async function submitSurvey(
  payload: SurveySubmitRequest,
): Promise<SurveySubmitResponse> {
  const response = await fetch(`${API_BASE_URL}/surveys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Survey submit failed: ${response.statusText}`);
  }

  return response.json();
}

// 설문 조회
export async function getSurvey(sessionId: string): Promise<SurveyGetResponse> {
  const response = await fetch(`${API_BASE_URL}/surveys/${sessionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Get survey failed: ${response.statusText}`);
  }

  return response.json();
}

// 루틴 업데이트
export async function updateRoutine(
  sessionId: string,
  payload: RoutineUpdateRequest,
): Promise<RoutineUpdateResponse> {
  const response = await fetch(`${API_BASE_URL}/routine/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Routine update failed: ${response.statusText}`);
  }

  return response.json();
}

// 루틴 조회
export async function getRoutine(sessionId: string): Promise<RoutineGetResponse> {
  const response = await fetch(`${API_BASE_URL}/routine/${sessionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Get routine failed: ${response.statusText}`);
  }

  return response.json();
}
