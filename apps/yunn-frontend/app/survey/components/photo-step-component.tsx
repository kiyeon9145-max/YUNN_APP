"use client";

// photo-step-component.tsx — Step 10 피부 사진 업로드 화면
//
// 사진 업로드/미리보기만 담당한다. 업로드 버튼과 Back/Complete/Skip 버튼은
// button-component.tsx에서 가져와 다른 설문 버튼과 같은 중앙 컴포넌트 규칙을 따른다.

import Image from "next/image";
import { useRef, useState } from "react";
import { PhotoStepActions, PhotoUploadButton } from "./button-component";

interface PhotoStepProps {
  onBack: () => void;
  onComplete: (photoDataUrl?: string) => void;
  onSkip: () => void;
}

export default function PhotoStep({
  onBack,
  onComplete,
  onSkip,
}: PhotoStepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result =
        typeof e.target?.result === "string" ? e.target.result : "";
      setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <h2 className="mb-[10px] text-[24px] font-bold leading-[1.17] tracking-[-0.01em] text-black">
        One last step.
        <br />
        Let&apos;s <span className="text-primary">track your progress</span>.
      </h2>

      <p className="mb-6 text-[13px] font-normal leading-[1.4] tracking-[-0.2px] text-black">
        Upload a clear photo of your skin in natural lighting.
        <br />
        We&apos;ll use this to measure your skin progress over time.
      </p>

      <div className="mb-6 rounded-[12px] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <PhotoUploadButton
          onClick={() => inputRef.current?.click()}
          hasPreview={Boolean(photoDataUrl)}
        >
          {photoDataUrl ? (
            <Image
              src={photoDataUrl}
              alt="Selected skin photo preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5FAF9] text-primary">
                <i className="ph-light ph-camera text-2xl"></i>
              </div>
              <div className="mb-1.5 text-[15px] font-bold text-black">
                Upload your skin photo
              </div>
              <div className="text-[11px] font-normal text-[#999]">
                Front-facing · Natural light · No filter
              </div>
            </>
          )}
        </PhotoUploadButton>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F5FAF9] text-lg text-primary">
          <i className="ph-bold ph-shield-check"></i>
        </div>
        <div className="text-xs leading-[1.4] text-[#888]">
          Your photos are private and only used
          <br />
          to track your skin progress.
        </div>
      </div>

      <PhotoStepActions
        onBack={onBack}
        onComplete={() => onComplete(photoDataUrl || undefined)}
        onSkip={onSkip}
      />
    </>
  );
}
