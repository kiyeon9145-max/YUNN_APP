"use client";

// survey/feedback/page.tsx — 후기 설문 (구글폼 대체)
//
// 새로 만든 척도형/주관식 설문 컴포넌트(scale-question-component, text-question-component)와
// 완료 안내 화면(WhatsAppCompleteScreen)을 조합한 예시 플로우.
// 텍스트·목록 데이터만 바꾸면 다른 후기 설문에도 그대로 재사용할 수 있다.

import { useState } from "react";
import { useRouter } from "next/navigation";
import SurveyShell from "../screens/SurveyShell";
import ScaleQuestionStep from "../components/scale-question-component";
import TextQuestionStep from "../components/text-question-component";
import WhatsAppCompleteScreen from "../screens/WhatsAppCompleteScreen";

type FeedbackStep = "usefulness" | "reason" | "done";

export default function FeedbackSurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState<FeedbackStep>("usefulness");
  const [usefulness, setUsefulness] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  return (
    <>
      {step === "usefulness" && (
        <SurveyShell currentStep={3} totalSteps={5}>
          <ScaleQuestionStep
            title="How useful was your personalized skin plan?"
            minLabel="Not useful at all"
            maxLabel="Extremely useful"
            requiredMessage="Please rate how useful your plan was."
            onNext={(value) => {
              setUsefulness(value);
              setStep("reason");
            }}
            onBack={() => router.push("/survey")}
          />
        </SurveyShell>
      )}

      {step === "reason" && (
        <SurveyShell currentStep={4} totalSteps={5}>
          <TextQuestionStep
            title="What made you decide to unlock your 14-day skin plan?"
            placeholder="Type your answer here..."
            maxLength={1000}
            requiredMessage="Please share what made you decide to unlock your plan."
            onNext={(value) => {
              setReason(value);
              setStep("done");
            }}
            onBack={() => setStep("usefulness")}
          />
        </SurveyShell>
      )}

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
          whatsappPhoneNumber="911234567890"
          whatsappMessage={`Hi YUNN! I completed my skin survey (usefulness: ${usefulness}, reason: ${reason}). I'd like to receive my personalized skin report.`}
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
