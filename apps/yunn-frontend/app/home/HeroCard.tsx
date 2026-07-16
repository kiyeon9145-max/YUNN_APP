"use client";

// HeroCard.tsx — 개인화 히어로 섹션
//
// localStorage에서 yunnUser / yunnUserNickname을 읽어 로그인 여부를 판단한다.
// home.js renderPersonalHero() 동작과 동일.
//
// 로그인: "Hi, {nickname}" + Routine Ring (3/5) + "My skin Profile" CTA
// 비로그인: "Welcome to YUNN" + "Log in to continue" CTA + 제품 이미지 확대

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type User } from "./home-data";

export default function HeroCard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("yunnUser") || "null");
      if (saved?.nickname) {
        setUser(saved);
        return;
      }
    } catch {
      localStorage.removeItem("yunnUser");
    }
    const nick = localStorage.getItem("yunnUserNickname");
    if (nick) setUser({ nickname: nick });
  }, []);

  const loggedIn = !!user;

  return (
    <section className="min-h-[127px] rounded-[5px] bg-[#F1F6F6] relative overflow-hidden p-[20px_18px]">
      {/* 텍스트 영역 — 너비: 로그인 170px / 비로그인 235px */}
      <div className={`relative z-[2] ${loggedIn ? "w-[170px]" : "w-[235px]"}`}>
        {loggedIn ? (
          <>
            <h1 className="text-[16px] font-bold leading-[1.25] mb-[12px]">
              Hi, <span>{user!.nickname}</span>
            </h1>
            <p className="text-[14px] leading-[1.45] mb-[13px] max-w-[156px]">
              Your skin journey is{" "}
              <strong className="block text-[#3AAE92] font-bold">
                on track
              </strong>
            </p>
            <Link
              href="/survey"
              className="inline-flex items-center gap-[5px] min-h-[26px] px-[10px] py-[7px] border border-[#F2F2F2] rounded-[5px] bg-white no-underline text-[10px] whitespace-nowrap"
            >
              My skin Profile <i className="ph ph-arrow-right" />
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-[16px] font-bold leading-[1.25] mb-[12px]">
              Welcome to YUNN
            </h1>
            <p className="text-[15px] leading-[1.48] mb-[14px] max-w-[232px]">
              Log in to track your skin journey{" "}
              <strong className="block text-[#3AAE92] font-bold">
                and routine progress
              </strong>
            </p>
            <Link
              href="/survey"
              className="inline-flex items-center gap-[5px] min-h-[26px] px-[10px] py-[7px] border border-[#F2F2F2] rounded-[5px] bg-white no-underline text-[10px] whitespace-nowrap"
            >
              Log in to continue <i className="ph ph-arrow-right" />
            </Link>
          </>
        )}
      </div>

      {/* Routine Ring — 로그인 시에만 표시. home.css .routine-ring */}
      {loggedIn && (
        <div className="absolute right-[87px] top-[16px] w-[92px] h-[92px] rounded-full border-[5px] border-[rgba(58,174,146,0.35)] bg-[rgba(241,246,246,0.9)] flex flex-col items-center justify-center z-[3]">
          <span className="text-[10px] leading-[1.2]">Routine</span>
          <strong className="text-[#3AAE92] text-[16px] leading-[1.35]">
            3/5
          </strong>
          <span className="text-[10px] leading-[1.2]">steps done</span>
        </div>
      )}

      {/* 제품 이미지 — home.css .hero-product / .hero-card.logged-out .hero-product */}
      <Image
        src="/images/YUNN_Web_image_1_nobg.png"
        alt="YUNN routine products"
        width={202}
        height={155}
        className={`absolute object-contain z-[1] ${
          loggedIn
            ? "right-[-42px] bottom-[-14px] w-[202px] h-[155px]"
            : "right-[-44px] bottom-[-13px] w-[186px] h-[150px] opacity-[0.96]"
        }`}
      />
    </section>
  );
}
