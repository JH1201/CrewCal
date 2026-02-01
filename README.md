# Calendar MVP v2 (React + Spring Boot, PostgreSQL 16, No JPA)

요구사항 확장:
- 구글(OAuth2) 또는 이메일(비밀번호) 로그인
- 캘린더 공유 초대 메일 발송
- Invite 수락/거절 화면(웹/모바일 공통 라우트)
- 공유 멤버 관리 UI (멤버 목록, 권한 변경, 제거, Pending invite 조회/취소)

## 구성
- `frontend/` : React Native
- `backend/` : Spring Boot (Gradle) + Spring Security (JWT) + OAuth2 Google + JdbcTemplate
- `docker-compose.yml` : PostgreSQL 16

## 빠른 실행 (로컬)
### 1) PostgreSQL
```bash
docker compose up -d
```

### 2) Backend
```bash
cd backend
gradle bootRun
```

Backend: http://localhost:8080

### 3) Frontend
```bash
cd /Crewcal/CrewCal-main/calendar-rn-ui
npx expo start -c
```
Frontend: http://localhost:8081

## 환경설정 (중요)
### Backend: `backend/src/main/resources/application.properties`
- PostgreSQL 접속정보 수정
- JWT 시크릿 수정
- Google OAuth2 설정
- 메일(SMTP) 설정
- 프론트/백엔드 베이스 URL 설정

## 인증 흐름
- 이메일 로그인: `/login` → JWT 발급 → LocalStorage 저장 → API 호출 시 `Authorization: Bearer <token>`
- 구글 로그인: 프론트에서 `GET {BACKEND}/oauth2/authorization/google`
  - 로그인 성공 시 백엔드가 `/oauth2/callback?token=...` 으로 리다이렉트

## Invite 흐름
- Owner가 Share 모달에서 이메일/권한 선택 → Invite 생성 + 메일 발송
- 수신자는 링크(`/invite/{token}`)로 이동 → 로그인 필요 → Accept/Decline

## 권한 규칙
- Owner: 공유(초대/변경/해제) 가능
- Editor: 일정 CRUD 가능
- Viewer: 읽기 전용
- FreeBusy: Busy만 (제목/메모 마스킹)

## 확장
- 캘린더 + 가계부
