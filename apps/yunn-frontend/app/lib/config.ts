// config.ts — 루틴 트래킹 기능이 쓰는 localStorage 키·정책값 중앙 관리
//
// 값은 legacy vanilla 사이트의 js/domain/AppConfig.js와 문자열/숫자를 그대로 맞춘다.
// yunn_session_id처럼 두 프론트가 같은 브라우저에서 같은 데이터를 봐야 하므로
// 키 이름을 임의로 바꾸지 않는다.

export const STORAGE_KEYS = {
  PENDING_RESULT: "yunn_pending_result_data", // 설문 결과 { skinType, concernType, gender, name, email }
  SURVEY_PROGRESS: "yunn_survey_progress", // 설문 진행 상태 { step, answers } — 새로고침/뒤로가기 복원용
  ROUTINE_START: "yunn_routine_start", // 루틴 시작일 "YYYY-MM-DD"
  ROUTINE_CHECKS: "yunn_routine_checks", // 일자별 스텝 완료 상태
  PHOTO_BEFORE: "yunn_photo_before", // Before 사진 { dataUrl, date }
  PHOTO_AFTER: "yunn_photo_after", // After 사진 { dataUrl, date }
} as const;

export const ROUTINE_CONFIG = {
  BEFORE_AFTER_UNLOCK_DAY: 14, // After 사진 업로드 잠금 해제 기준일
  MORNING_START_HOUR: 6, // 아침 알림 시작 시각
  MORNING_END_HOUR: 10, // 아침 알림 종료 시각
  EVENING_START_HOUR: 20, // 저녁 알림 시작 시각
  EVENING_END_HOUR: 23, // 저녁 알림 종료 시각
} as const;
