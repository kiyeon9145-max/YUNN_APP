// 설문 concern 값을 정규화합니다
export function toConcernKey(concern: string | undefined): string | undefined {
  if (!concern) return undefined;

  const mapping: Record<string, string> = {
    "Uneven skin tone": "Tone",
    "Acne marks": "Marks",
  };

  return mapping[concern] || concern;
}
