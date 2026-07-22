"use client";

// survey/feedback/page.tsx — 14일 플랜 피드백 설문 (9문항)
//
// 척도형(Q1~4, 8, 9) + 주관식(Q5~7) + 완료 안내(WhatsApp) 플로우
// 각 스텝은 자체 상태(select/textarea input)를 가지고, 상단 answers 객체에만 병합한다.
// 새로고침 시 상태가 초기화되는 단순 구조 (localStorage 저장 없음).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionId } from "@/app/lib/analytics";
import SurveyShell from "../screens/SurveyShell";
import ScaleQuestionStep from "../components/scale-question-component";
import TextQuestionStep from "../components/text-question-component";
import WhatsAppCompleteScreen from "../screens/WhatsAppCompleteScreen";
import { sendFeedbackCompletionToSheet } from "../feedback-sheet";

type FeedbackStep =
  | "usefulness"
  | "accuracy"
  | "routineConfidence"
  | "recommend"
  | "unlockReason"
  | "helpWishlist"
  | "weeklyUseReason"
  | "dailyGuidanceValue"
  | "startLikelihood"
  | "done";

interface FeedbackAnswers {
  usefulness?: string;
  accuracy?: string;
  routineConfidence?: string;
  recommend?: string;
  unlockReason?: string;
  helpWishlist?: string;
  weeklyUseReason?: string;
  dailyGuidanceValue?: string;
  startLikelihood?: string;
}

export default function FeedbackSurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState<FeedbackStep>("usefulness");
  const [answers, setAnswers] = useState<FeedbackAnswers>({});

  const merge = (partial: Partial<FeedbackAnswers>) =>
    setAnswers((prev) => ({ ...prev, ...partial }));

  // done 스텝 진입 시 Google Sheets로 답변 전송
  useEffect(() => {
    if (step === "done") {
      sendFeedbackCompletionToSheet(answers);
    }
  }, [step, answers]);

  return (
    <>
      {/* ── Q1: How useful was your personalized skin plan? ──────────────────── */}
      {step === "usefulness" && (
        <SurveyShell hideHeader showCustomHeader currentStep={1} totalSteps={9}>
          <ScaleQuestionStep
            title="How useful was your personalized skin plan?"
            minLabel="Not useful at all"
            maxLabel="Extremely useful"
            requiredMessage="Please rate how useful your plan was."
            onNext={(value) => {
              merge({ usefulness: value });
              setStep("accuracy");
            }}
            onBack={() => router.push("/survey")}
          />
        </SurveyShell>
      )}

      {/* ── Q2: How accurately did YUNN identify your skin type and concerns? ── */}
      {step === "accuracy" && (
        <SurveyShell hideHeader showCustomHeader currentStep={2} totalSteps={9}>
          <ScaleQuestionStep
            title="How accurately did YUNN identify your skin type and concerns?"
            minLabel="Didn't match at all"
            maxLabel="Matched perfectly"
            requiredMessage="Please rate how accurate YUNN's analysis was."
            onNext={(value) => {
              merge({ accuracy: value });
              setStep("routineConfidence");
            }}
            onBack={() => setStep("usefulness")}
          />
        </SurveyShell>
      )}

      {/* ── Q3: Before using YUNN, how sure were you that your skincare routine was right for your skin? ── */}
      {step === "routineConfidence" && (
        <SurveyShell hideHeader showCustomHeader currentStep={3} totalSteps={9}>
          <ScaleQuestionStep
            title="Before using YUNN, how sure were you that your skincare routine was right for your skin?"
            minLabel="Not sure at all"
            maxLabel="Completely sure"
            requiredMessage="Please rate your confidence level."
            onNext={(value) => {
              merge({ routineConfidence: value });
              setStep("recommend");
            }}
            onBack={() => setStep("accuracy")}
          />
        </SurveyShell>
      )}

      {/* ── Q4: How likely are you to recommend YUNN to a friend? ───────────── */}
      {step === "recommend" && (
        <SurveyShell hideHeader showCustomHeader currentStep={4} totalSteps={9}>
          <ScaleQuestionStep
            title="How likely are you to recommend YUNN to a friend?"
            minLabel="Not at all likely"
            maxLabel="Extremely likely"
            requiredMessage="Please rate how likely you are to recommend YUNN."
            onNext={(value) => {
              merge({ recommend: value });
              setStep("unlockReason");
            }}
            onBack={() => setStep("routineConfidence")}
          />
        </SurveyShell>
      )}

      {/* ── Q5: What made you decide to unlock your 14-day skin plan? ──────── */}
      {step === "unlockReason" && (
        <SurveyShell hideHeader showCustomHeader currentStep={5} totalSteps={9}>
          <TextQuestionStep
            title="What made you decide to unlock your 14-day skin plan?"
            requiredMessage="Please share what made you decide to unlock your plan."
            onNext={(value) => {
              merge({ unlockReason: value });
              setStep("helpWishlist");
            }}
            onBack={() => setStep("recommend")}
          />
        </SurveyShell>
      )}

      {/* ── Q6: What else would you like YUNN to help you with? ────────────── */}
      {step === "helpWishlist" && (
        <SurveyShell hideHeader showCustomHeader currentStep={6} totalSteps={9}>
          <TextQuestionStep
            title="What else would you like YUNN to help you with?"
            requiredMessage="Please share what else YUNN could help with."
            onNext={(value) => {
              merge({ helpWishlist: value });
              setStep("weeklyUseReason");
            }}
            onBack={() => setStep("unlockReason")}
          />
        </SurveyShell>
      )}

      {/* ── Q7: What would make YUNN a product you would use every week? ───── */}
      {step === "weeklyUseReason" && (
        <SurveyShell hideHeader showCustomHeader currentStep={7} totalSteps={9}>
          <TextQuestionStep
            title="What would make YUNN a product you would use every week?"
            requiredMessage="Please share what would make you use YUNN weekly."
            onNext={(value) => {
              merge({ weeklyUseReason: value });
              setStep("dailyGuidanceValue");
            }}
            onBack={() => setStep("helpWishlist")}
          />
        </SurveyShell>
      )}

      {/* ── Q8: How valuable would it be to have someone guide you through your skincare routine every day? ── */}
      {step === "dailyGuidanceValue" && (
        <SurveyShell hideHeader showCustomHeader currentStep={8} totalSteps={9}>
          <ScaleQuestionStep
            title="How valuable would it be to have someone guide you through your skincare routine every day?"
            minLabel="I don't need it"
            maxLabel="I really need it"
            requiredMessage="Please rate the value of daily guidance."
            onNext={(value) => {
              merge({ dailyGuidanceValue: value });
              setStep("startLikelihood");
            }}
            onBack={() => setStep("weeklyUseReason")}
          />
        </SurveyShell>
      )}

      {/* ── Q9: If YUNN were available today, how likely would you be to start using it? ── */}
      {step === "startLikelihood" && (
        <SurveyShell hideHeader showCustomHeader currentStep={9} totalSteps={9}>
          <ScaleQuestionStep
            title="If YUNN were available today, how likely would you be to start using it?"
            minLabel="Not at all likely"
            maxLabel="Extremely likely"
            requiredMessage="Please rate how likely you are to start using YUNN today."
            onNext={(value) => {
              merge({ startLikelihood: value });
              setStep("done");
            }}
            onBack={() => setStep("dailyGuidanceValue")}
          />
        </SurveyShell>
      )}

      {/* ── Done: WhatsApp 안내 페이지 ────────────────────────────────────────── */}
      {step === "done" && (
        <WhatsAppCompleteScreen
          stepLabels={["Personal", "Skin", "Lifestyle", "Goals", "Finish"]}
          title="Your 14-Day Skin Plan is Ready!"
          description={
            "Thank you for completing the survey. We've created a personalized plan just for your skin."
          }
          reportIncludesTitle="Your report includes:"
          features={[
            { icon: "ph ph-user", label: "Your Skin Analysis" },
            { icon: "ph ph-eyedropper", label: "Personalized Ingredients" },
            { icon: "ph ph-moon-stars", label: "AM / PM Routine" },
            { icon: "ph ph-calendar-check", label: "14-Day Improvement Plan" },
            { icon: "ph ph-file-text", label: "Skincare Tips & Guides" },
          ]}
          ctaHint="To receive your report, send the pre-filled message on WhatsApp."
          ctaLabel="Receive My Report on WhatsApp"
          whatsappPhoneNumber="821062025254"
          whatsappMessage={`Hi YUNN!\nI completed my skin survey.\nSession ID: ${getSessionId()}\nI'd like to receive my personalized skin report!`}
          instructions={[
            { step: 1, text: "Tap the button above." },
            { step: 2, text: "WhatsApp will open with a pre-filled message." },
            {
              step: 3,
              text: "Just tap Send, and we'll deliver your personalized skin report!",
            },
          ]}
        />
      )}
    </>
  );
}
