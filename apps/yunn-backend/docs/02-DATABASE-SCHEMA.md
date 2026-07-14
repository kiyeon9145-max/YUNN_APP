# 2. 데이터베이스 설정

---

## 2.1 PostgreSQL 준비

3가지 옵션이 있습니다. 팀 상황에 맞는 것을 선택하세요:

| 옵션 | 방식 | 장점 | 단점 |
|------|------|------|------|
| **로컬** | Homebrew 또는 직설치 | 개발 속도 빠름 | 팀원 환경 차이 가능 |
| **Docker** | 컨테이너 | 팀 일관성 좋음 | Docker 설치 필요 |
| **Supabase** | 클라우드 | 배포처와 통일 가능 | 인터넷 필수 |

**권장**: 로컬 또는 Docker 선택 (개발 속도 빠르고 비용 없음)

설치 후 연결 정보 확인:
- Host: localhost
- Port: 5432
- User: postgres
- Password: (설정한 것)
- Database: yunn_dev (처음 생성 필요)

---

## 2.2 데이터 모델 정의

`prisma/schema.prisma` 파일에 2개 모델을 정의합니다.

### SurveySubmission (설문 제출)
사용자가 완료한 설문 1건을 저장합니다.

| 필드 | 설명 |
|------|------|
| id | 고유 ID (자동 생성) |
| sessionId | 사용자 세션 ID (프론트의 yunn_session_id) |
| city, gender, age, skinType, concerns 등 | 사용자 입력값 |
| trigger | 배열 (humidity, stress 등) |
| resultSkinType | 서버 계산 결과 (Oily/Dry/Combination/Normal) |
| resultConcernType | 서버 계산 결과 (Acne/Marks/Pigmentation/Tone) |
| createdAt | 저장 시각 (자동) |

sessionId는 인덱스 처리되어 빠른 조회 가능합니다.

### RoutineCheck (루틴 체크)
특정 날짜의 루틴 체크 상태를 저장합니다.

| 필드 | 설명 |
|------|------|
| id | 고유 ID |
| sessionId | 사용자 세션 ID |
| dateKey | 날짜 (YYYY-MM-DD 형식) |
| morning | 아침 4개 스텝 체크 [true/false, ...] |
| evening | 저녁 4개 스텝 체크 [true/false, ...] |

sessionId + dateKey 조합으로 유니크합니다 (한 날짜는 1개 row만).

---

## 2.3 DBeaver 설정

DBeaver는 PostgreSQL을 그래픽 인터페이스로 관리하는 도구입니다 (선택사항이지만 권장).

### 설치 및 연결
1. [dbeaver.io](https://dbeaver.io)에서 Community Edition 다운로드
2. 설치 후 실행
3. Database → New Database Connection → PostgreSQL 선택
4. 연결 정보 입력 (위의 Host, Port, User, Password, Database)
5. "Test Connection" 클릭해서 성공 확인

### DB 생성 (처음 한 번)
DBeaver의 SQL 편집기에서:
```sql
CREATE DATABASE yunn_dev WITH ENCODING 'UTF8';
```

---

## 2.4 Prisma 마이그레이션

Prisma는 스키마 정의를 읽고 SQL을 자동으로 생성해줍니다.

### 마이그레이션 실행
```bash
npx prisma migrate dev --name init
```

이 명령은:
1. schema.prisma 읽기
2. SQL 파일 생성 (prisma/migrations/ 폴더)
3. PostgreSQL에 테이블 생성
4. Prisma Client 자동 생성

### 결과 확인
DBeaver에서 "SurveySubmission", "RoutineCheck" 테이블이 생성됐는지 확인합니다.

---

## 2.5 Repository 패턴

DB 접근은 Repository 패턴으로 하나의 레이어로 모읍니다.

### 구조
`src/outbound/persistence/` 폴더에:
- `surveyRepository.ts`: SurveySubmission 관련 쿼리
- `routineRepository.ts`: RoutineCheck 관련 쿼리

각 Repository는:
- `create()`: 데이터 저장
- `findLatestBySessionId()`: 최신 데이터 조회
- `upsert()`: 있으면 업데이트, 없으면 생성

이렇게 분리하면 테스트하기 쉽고, 나중에 DB를 바꿀 때도 이 파일들만 수정하면 됩니다.

---

## 2.6 마이그레이션 관리

### 히스토리 확인
```bash
npx prisma migrate status
```

실행된 마이그레이션 목록을 확인할 수 있습니다.

### 새 필드 추가 (나중에)
schema.prisma를 수정한 후:
```bash
npx prisma migrate dev --name describe_your_change
```

새 마이그레이션 파일이 자동 생성되고 DB에 적용됩니다.

### 개발 중 초기화 (주의)
로컬에서만 (프로덕션 절대 금지):
```bash
npx prisma migrate reset
```
모든 데이터를 삭제하고 마이그레이션을 처음부터 재실행합니다.

---

## 2.7 Prisma Studio (선택)

PostgreSQL을 GUI로 보고 싶을 때:
```bash
npx prisma studio
```

http://localhost:5555 에서 데이터를 시각적으로 관리할 수 있습니다.

---

## 다음: API 스펙 정의

**다음**: [03-API-SPECS.md](./03-API-SPECS.md) - 4개 API의 요청/응답 명세
