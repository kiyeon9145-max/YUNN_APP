"use client";

// PhotoCapture.tsx — Before/After 사진 업로드 공용 컴포넌트
// 원본 이미지를 canvas에서 JPEG 0.5 품질로 압축한 뒤 dataUrl로 넘긴다 (localStorage ~5MB 제한 대응).

import { useRef, useState } from "react";
import { getDayKey } from "../lib/routine-domain";
import type { RoutinePhoto } from "../lib/routine-storage";

interface PhotoCaptureProps {
  onCapture: (photo: RoutinePhoto) => void;
  buttonLabel?: string;
  existingDataUrl?: string;
}

function compressToJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1) 파일을 dataUrl로 읽는다
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      // 2) dataUrl을 Image로 디코딩한다
      const img = new window.Image();
      img.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
      img.onload = () => {
        // 3) canvas에 그려서 JPEG 0.5 품질로 재인코딩한다
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.5));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoCapture({
  onCapture,
  buttonLabel = "Upload Photo",
  existingDataUrl,
}: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingDataUrl ?? null);
  const [busy, setBusy] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressToJpeg(file);
      setPreview(dataUrl);
      onCapture({ dataUrl, date: getDayKey() });
    } catch {
      // 압축/읽기 실패는 조용히 무시 — 사용자가 다시 시도할 수 있다.
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full aspect-[3/4] rounded-[8px] bg-[#F5F5F5] border border-[#EAEAEA] overflow-hidden flex items-center justify-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <i className="ph ph-camera text-[36px] text-[#B6B6B6]" />
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="w-full h-[46px] rounded-[5px] bg-primary text-white text-[14px] font-bold border-0 cursor-pointer disabled:opacity-60"
      >
        {busy ? "Processing..." : buttonLabel}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
