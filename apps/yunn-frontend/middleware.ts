import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /survey 경로에만 A/B 테스팅 적용
  if (pathname === "/survey") {
    // 쿠키에서 variant 확인
    const existingVariant = request.cookies.get("ab_variant")?.value;

    // 있으면 그냥 통과, 없으면 새로 설정
    const response = NextResponse.next();

    if (!existingVariant) {
      const randomVariant = Math.random() < 0.5 ? "A" : "B";
      response.cookies.set("ab_variant", randomVariant, {
        maxAge: 60 * 60 * 24 * 30, // 30일
        path: "/",
        sameSite: "strict",
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/survey"],
};
