# 문서 작성 가이드

- 한글로 작성해야 합니다.
- 문서는 반드시 200줄 이하로 완성합니다.

# 코드 작성 가이드

- 함수를 작성할 때, 함수 내부에 논리 단위로 주석을 작성해주세요.
- 주석은 핵심만 담아서 짧고 간결하게 한 문장으로 써야합니다.
- 예: `// localStorage에서 설문 진행상태 복원`

# React/TypeScript 컴포넌트 작성 가이드

- 모든 컴포넌트는 명확한 Props 인터페이스를 정의해야 합니다.
- 상태 관리: useState (단순 UI 상태), localStorage (영속성 필요), 커스텀 훅 (복잡한 로직)
- "use client" 선언은 필요한 곳에만 사용하세요. (상태, 이벤트, 훅 필요 시)
- 타입 정의는 컴포넌트 파일 상단 또는 별도 types 파일에 작성하세요.
- 예:
  ```tsx
  interface ProductCardProps {
    product: Product
    onAddToCart: (item: CartItem) => void
  }
  
  export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    // 구현
  }
  ```

# 테스트 코드 작성 가이드

- 단위 테스트: 유틸리티 함수 (analytics.ts, survey-progress.ts, routine-domain.ts 등)
- 컴포넌트 테스트: 복잡한 로직이나 여러 상태를 다루는 컴포넌트
- TDD 원칙: 먼저 테스트를 작성하고, 테스트를 통과하는 최소한의 구현을 작성합니다.
- npm run test로 테스트 실행 및 검증하세요.
- 기존 테스트 실패 시 작업을 중단하고 원인을 분석해서 알려주세요.

# 분석(Analytics) 이벤트 추가 시 체크리스트

- [ ] 이벤트 함수를 app/lib/analytics.ts에 정의했는가?
- [ ] 이벤트명은 snake_case (예: `survey_started`, `routine_checked`)
- [ ] 필수 데이터: timestamp, 사용자 구분 정보 (가능시)
- [ ] trackEvent() 호출 시점이 명확한가? (페이지 진입, 액션 완료 후, 등)
- [ ] Google Tag Manager에서 실제로 데이터가 수집되는가? (개발자 도구 dataLayer 확인)

# localStorage 사용 시 주의사항

- 키 네이밍: kebab-case 사용 (예: `survey-progress`, `routine-storage`)
- 데이터 구조: 명확한 인터페이스 정의 필수
- 버전 관리: 스키마 변경 시 이전 데이터 마이그레이션 로직 추가
- 용량 제한: 이미지는 base64로 저장 시 용량 주의 (5MB 초과 시 문제 가능)

# 추가 주의사항

- TypeScript 타입 검사: npm run build 후 타입 에러 확인
- 린트 검사: npm run lint로 코드 스타일 검증
- 환경 변수: .env.local에서 설정, .env.example은 공개 가능한 예시만 포함
- 모든 외부 의존성(함수, 객체)은 타입/인터페이스로 계약을 명시해야 합니다.
- 기존 테스트 실패 시 새로운 코드와의 연관성을 분석 후 보고하세요.
