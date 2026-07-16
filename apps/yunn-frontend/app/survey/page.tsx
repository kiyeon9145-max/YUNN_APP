"use client";

// survey/page.tsx — 설문 SPA 오케스트레이터
//
// 구현된 스텝: intro → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
// 추후 구현 순서: Analysis/Result
//
// 컴포넌트 구조:
//   survey-component  → Step 1, 2, 5~9 (성별/연령/지역 등 옵션 카드 선택 패턴 공용)
//   region-component  → Step 2 (거주 도시, 라디오 5개 + Other 직접입력)
//   image-survey      → Step 3~4 (이미지 카드 선택)
//   photo-step        → Step 10 (피부 사진 업로드/미리보기)
//   SurveyShell       → 설문 공통 껍데기 (헤더 + 프로그레스 바)
//
// 이름/이메일/전화번호 입력 스텝은 app/survey/_archived/에 보관 중 (서비스 오픈 시 복원 예정).

import { useEffect, useState } from "react";
import { setAnalyticsContext } from "../lib/analytics";
import { getSurveyProgress, saveSurveyProgress } from "./survey-progress";
import IntroScreen from "./screens/IntroScreen";
import SurveyShell from "./screens/SurveyShell";
import AnalysisScreen from "./screens/AnalysisScreen";
import ResultScreen from "./screens/ResultScreen";
import SurveyOptionStep from "./components/survey-component";
import RegionStep from "./components/region-component";
import ImageSurveyStep from "./components/image-survey-component";
import PhotoStep from "./components/photo-step-component";
import {
  STEP1_GROUPS,
  STEP3_HELPER_STEPS,
  STEP3_IMAGE_OPTIONS,
  STEP4_IMAGE_OPTIONS,
  STEP5_GROUPS,
  STEP6_GROUPS,
  STEP7_GROUPS,
  STEP8_GROUPS,
  STEP9_GROUPS,
  SKIN_INFERENCE_RULES,
  type SkinHelperStepId,
} from "./step-data";
import {
  trackSurveyComplete,
  trackSurveySkinTypeInferred,
  trackSurveyStart,
  trackSurveyStepComplete,
  trackSurveyStepView,
} from "./survey-analytics";

// ── 답변 타입 ──────────────────────────────────────────────────────────────
export interface SurveyAnswers {
  // 이름/이메일/전화는 현재 설문에서 수집하지 않는다 (app/survey/_archived/ 참조).
  // ResultScreen이 기본값으로 폴백하므로 필드 자체는 남겨둔다.
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  gender?: string;
  age?: string;
  skinType?: string;
  skinHelperCleanse?: string;
  skinHelperAfterHours?: string;
  skinHelperDay?: string;
  skinHelperTexture?: string;
  concerns?: string;
  trigger?: string[];
  sensitivity?: string;
  outdoor?: string;
  sunscreen?: string;
  sleep?: string;
  stress?: string;
  routineLevel?: string;
  photoDataUrl?: string;
}

export type SurveyStep =
  | "intro"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | SkinHelperStepId
  | "analysis"
  | "result";

function inferSkinTypeFromHelper(answers: SurveyAnswers): string {
  const values = [
    answers.skinHelperCleanse,
    answers.skinHelperAfterHours,
    answers.skinHelperDay,
    answers.skinHelperTexture,
  ].map((value) => Number(value || 0));

  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const hasTZonePattern = values.includes(SKIN_INFERENCE_RULES.T_ZONE_VALUE);

  if (avg <= SKIN_INFERENCE_RULES.DRY_MAX) return "Dry";
  if (avg >= SKIN_INFERENCE_RULES.OILY_MIN) return "Oily";
  if (
    hasTZonePattern ||
    (avg > SKIN_INFERENCE_RULES.COMBINATION_MIN &&
      avg < SKIN_INFERENCE_RULES.OILY_MIN)
  ) {
    return "Combination";
  }
  return "Normal";
}

// ── 페이지 ─────────────────────────────────────────────────────────────────
export default function SurveyPage() {
  const [step, setStep] = useState<SurveyStep | "loading">("loading");
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [hydrated, setHydrated] = useState(false);

  const merge = (partial: Partial<SurveyAnswers>) =>
    setAnswers((prev) => ({ ...prev, ...partial }));

  // 첫 렌더에 저장된 진행 상태(step + answers)를 복원한다 — 없으면 intro부터 시작.
  useEffect(() => {
    const saved = getSurveyProgress();
    if (saved) {
      setAnswers(saved.answers);
      setStep(saved.step);
    } else {
      setStep("intro");
    }
    setHydrated(true);
  }, []);

  // 복원이 끝난 뒤부터는 step/answers가 바뀔 때마다 그대로 저장해
  // 새로고침·뒤로가기 후에도 같은 화면(결과 화면 포함)으로 돌아올 수 있게 한다.
  useEffect(() => {
    if (!hydrated || step === "loading") return;
    saveSurveyProgress({ step, answers });
  }, [hydrated, step, answers]);

  // 스텝 전환 시 이전 화면에서 스크롤한 위치가 남아있지 않도록 맨 위로 리셋한다
  useEffect(() => {
    if (step === "loading") return;
    window.scrollTo(0, 0);
    trackSurveyStepView(step);
  }, [step]);

  if (step === "loading") return null;

  return (
    <>
      {/* ── 인트로 ──────────────────────────────────────────────── */}
      {step === "intro" && (
        <IntroScreen
          onStart={() => {
            trackSurveyStart();
            setStep("1");
          }}
        />
      )}

      {/* ── Step 1: 성별 + 연령 ──────────────────────────────────── */}
      {step === "1" && (
        <SurveyShell currentStep={1} totalSteps={10}>
          <SurveyOptionStep
            title={
              <>
                Tell us <span className="text-primary">about you.</span>
              </>
            }
            subtitle="Gender and age help us refine your routine."
            groups={STEP1_GROUPS}
            autoAdvance
            showSecure
            requiredMessage="Please select your gender and age."
            onNext={(ans) => {
              // 성별/연령 답변은 결과 세분화 분석의 기본 축으로 기록한다.
              const partial = {
                gender: ans.gender as string,
                age: ans.age as string,
              };
              merge(partial);
              trackSurveyStepComplete("1", partial);
              setStep("2");
            }}
            onBack={() => setStep("intro")}
          />
        </SurveyShell>
      )}

      {/* ── Step 2: 거주 도시(지역) ──────────────────────────────── */}
      {step === "2" && (
        <SurveyShell currentStep={2} totalSteps={10}>
          <RegionStep
            onNext={(ans) => {
              // 도시 답변은 이후 모든 이벤트의 지역 컨텍스트로도 재사용한다.
              const partial = { city: ans.city };
              merge(partial);
              setAnalyticsContext({ city: ans.city });
              trackSurveyStepComplete("2", partial);
              setStep("3");
            }}
            onBack={() => setStep("1")}
          />
        </SurveyShell>
      )}

      {/* ── Step 3: 피부 타입 이미지 카드 ───────────────────────── */}
      {step === "3" && (
        <SurveyShell currentStep={3} totalSteps={10}>
          <ImageSurveyStep
            title={
              <>
                Let&apos;s understand
                <br />
                <span className="text-primary">your skin</span>
              </>
            }
            subtitle="This helps us create the perfect routine for you."
            question="Which one feels most like your skin?"
            helperText="There’s no right or wrong answer"
            options={STEP3_IMAGE_OPTIONS}
            showSecure
            requiredMessage="Please select your skin type."
            onNext={(value) => {
              // 피부 타입 선택은 추천 결과와 루틴 분기의 핵심 기준이다.
              merge({ skinType: value });
              trackSurveyStepComplete("3", { skin_type: value });
              setStep(value === "NotSure" ? "3-1" : "4");
            }}
            onBack={() => setStep("2")}
          />
        </SurveyShell>
      )}

      {/* ── Step 3-1 ~ 3-4: Not sure helper flow ───────────────── */}
      {(["3-1", "3-2", "3-3", "3-4"] as SkinHelperStepId[]).map(
        (helperStep) => {
          if (step !== helperStep) return null;
          const helper = STEP3_HELPER_STEPS[helperStep];
          const currentStepNumber = 3;
          const nextStepById: Record<SkinHelperStepId, SurveyStep> = {
            "3-1": "3-2",
            "3-2": "3-3",
            "3-3": "3-4",
            "3-4": "4",
          };
          const backStepById: Record<SkinHelperStepId, SurveyStep> = {
            "3-1": "3",
            "3-2": "3-1",
            "3-3": "3-2",
            "3-4": "3-3",
          };

          return (
            <SurveyShell
              key={helperStep}
              currentStep={currentStepNumber}
              totalSteps={10}
            >
              <SurveyOptionStep
                title={helper.title}
                subtitle={helper.subtitle}
                groups={helper.groups}
                showSecure
                requiredMessage="Please select the option that best describes your skin."
                onNext={(ans) => {
                  const partial = ans as Partial<SurveyAnswers>;
                  const nextAnswers = { ...answers, ...partial };
                  merge(partial);
                  // NotSure 보조 플로우 답변은 추론 품질을 나중에 점검하기 위해 남긴다.
                  trackSurveyStepComplete(helperStep, partial);
                  if (helperStep === "3-4") {
                    const inferredSkinType = inferSkinTypeFromHelper(nextAnswers);
                    merge({ skinType: inferredSkinType });
                    trackSurveySkinTypeInferred(inferredSkinType);
                  }
                  setStep(nextStepById[helperStep]);
                }}
                onBack={() => setStep(backStepById[helperStep])}
              />
            </SurveyShell>
          );
        },
      )}

      {/* ── Step 4: 주요 피부 고민 ──────────────────────────────── */}
      {step === "4" && (
        <SurveyShell currentStep={4} totalSteps={10}>
          <ImageSurveyStep
            title={
              <>
                What&apos;s bothering
                <br />
                <span className="text-primary">your skin</span> the most?
              </>
            }
            subtitle={
              <>
                Select your biggest skin concern.
                <br />
                This helps us create a routine that targets your main priority.
              </>
            }
            options={STEP4_IMAGE_OPTIONS}
            showSecure
            requiredMessage="Please select your biggest skin concern."
            onNext={(value) => {
              // 주요 고민은 결과 화면과 추천 루틴의 가장 중요한 세그먼트다.
              merge({ concerns: value });
              setAnalyticsContext({ skin_concern: value });
              trackSurveyStepComplete("4", { concern: value });
              setStep("5");
            }}
            onBack={() => setStep("3")}
          />
        </SurveyShell>
      )}

      {/* ── Step 5: 피부 악화 트리거 ─────────────────────────────── */}
      {step === "5" && (
        <SurveyShell currentStep={5} totalSteps={10}>
          <SurveyOptionStep
            title={
              <>
                When does
                <br />
                <span className="text-primary">your skin</span> get worse?
              </>
            }
            subtitle="Triggers help us understand your skin better."
            groups={STEP5_GROUPS}
            showSecure
            requiredMessage="Please select at least one skin trigger."
            onNext={(ans) => {
              // 악화 트리거는 다중 선택 분포와 루틴 메시지 개선에 쓴다.
              const partial = { trigger: ans.trigger as string[] };
              merge(partial);
              trackSurveyStepComplete("5", partial);
              setStep("6");
            }}
            onBack={() => setStep("4")}
          />
        </SurveyShell>
      )}

      {/* ── Step 6: 피부 민감도 ─────────────────────────────────── */}
      {step === "6" && (
        <SurveyShell currentStep={6} totalSteps={10}>
          <SurveyOptionStep
            title={
              <>
                How reactive
                <br />
                is <span className="text-primary">your skin?</span>
              </>
            }
            subtitle="This helps us personalize the right ingredients and strength for your skin."
            groups={STEP6_GROUPS}
            showSecure
            requiredMessage="Please select your skin sensitivity."
            onNext={(ans) => {
              // 민감도는 성분 강도와 제품 추천 리스크를 판단하는 기준이다.
              const partial = { sensitivity: ans.sensitivity as string };
              merge(partial);
              trackSurveyStepComplete("6", partial);
              setStep("7");
            }}
            onBack={() => setStep("5")}
          />
        </SurveyShell>
      )}

      {/* ── Step 7: 외출 시간 + 선크림 사용 ─────────────────────── */}
      {step === "7" && (
        <SurveyShell currentStep={7} totalSteps={10}>
          <SurveyOptionStep
            title={
              <>
                How much time do you
                <br />
                spend <span className="text-primary">outdoors?</span>
              </>
            }
            subtitle="This helps us understand your sun exposure and environmental factors."
            groups={STEP7_GROUPS}
            showSecure
            requiredMessage="Please select your outdoor time and sunscreen habit."
            onNext={(ans) => {
              // 외출/선크림 습관은 자외선 관련 루틴 추천을 보정한다.
              const partial = {
                outdoor: ans.outdoor as string,
                sunscreen: ans.sunscreen as string,
              };
              merge(partial);
              trackSurveyStepComplete("7", partial);
              setStep("8");
            }}
            onBack={() => setStep("6")}
          />
        </SurveyShell>
      )}

      {/* ── Step 8: 수면 + 스트레스 ─────────────────────────────── */}
      {step === "8" && (
        <SurveyShell currentStep={8} totalSteps={10}>
          <SurveyOptionStep
            title={
              <>
                How much <span className="text-primary">sleep</span>
                <br />
                do you usually get?
              </>
            }
            subtitle="This helps us understand your skin recovery and inflammation patterns."
            groups={STEP8_GROUPS}
            showSecure
            requiredMessage="Please select your sleep and stress level."
            onNext={(ans) => {
              // 수면/스트레스 답변은 생활 요인과 피부 고민의 관계를 보기 위해 기록한다.
              const partial = {
                sleep: ans.sleep as string,
                stress: ans.stress as string,
              };
              merge(partial);
              trackSurveyStepComplete("8", partial);
              setStep("9");
            }}
            onBack={() => setStep("7")}
          />
        </SurveyShell>
      )}

      {/* ── Step 9: 현재 스킨케어 루틴 수준 ─────────────────────── */}
      {step === "9" && (
        <SurveyShell currentStep={9} totalSteps={10}>
          <SurveyOptionStep
            title={
              <>
                What does your
                <br />
                <span className="text-primary">skincare routine</span>
                <br />
                look like right now?
              </>
            }
            groups={STEP9_GROUPS}
            showSecure
            requiredMessage="Please select your current routine level."
            onNext={(ans) => {
              // 현재 루틴 수준은 14일 루틴 난이도와 CTA 반응 분석에 사용한다.
              const partial = { routineLevel: ans.routineLevel as string };
              merge(partial);
              trackSurveyStepComplete("9", partial);
              setStep("10");
            }}
            onBack={() => setStep("8")}
          />
        </SurveyShell>
      )}

      {/* ── Step 10: 피부 사진 업로드 ───────────────────────────── */}
      {step === "10" && (
        <SurveyShell currentStep={10} totalSteps={10}>
          <PhotoStep
            onBack={() => setStep("9")}
            onComplete={(photoDataUrl) => {
              // 사진 업로드 여부는 분석 몰입도와 결과 신뢰도 지표로 분리해서 본다.
              const nextAnswers = { ...answers, photoDataUrl };
              merge({ photoDataUrl });
              trackSurveyStepComplete("10", { photo_uploaded: true });
              trackSurveyComplete(nextAnswers, true);
              setStep("analysis");
            }}
            onSkip={() => {
              // 스킵도 명시적으로 기록해 사진 단계 이탈과 구분한다.
              const nextAnswers = { ...answers, photoDataUrl: undefined };
              merge({ photoDataUrl: undefined });
              trackSurveyStepComplete("10", { photo_uploaded: false });
              trackSurveyComplete(nextAnswers, false);
              setStep("analysis");
            }}
          />
        </SurveyShell>
      )}

      {/* ── 분석 로딩 화면 ──────────────────────────────────────── */}
      {step === "analysis" && (
        <AnalysisScreen onComplete={() => setStep("result")} />
      )}

      {/* ── 결과 화면 ────────────────────────────────────────────── */}
      {step === "result" && (
        <ResultScreen answers={answers} onRetake={() => setStep("intro")} />
      )}
    </>
  );
}
