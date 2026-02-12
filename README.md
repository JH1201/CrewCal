# CrewCal

**CrewCal**은 팀/친구/크루 단위로 일정을 공유할 수 있는 **공유 캘린더 앱**입니다.  
로그인 후 캘린더를 생성하고, 공유 대상 단위로 일정 관리를 할 수 있도록 만드는 것이 목표입니다.


##  주요 기능 (Core Features)

- **로그인**
  - Google 로그인
  - Email 로그인
- **공유 캘린더 생성**
  - 사용자가 캘린더를 생성하고 공유할 수 있는 구조


##  기술 스택 (Tech Stack)

### Frontend
- **React Native**

### Backend
- **Spring Boot**
- **PostgreSQL**

### Infra / DevOps
- **Docker** 
- **Jenkins on Docker** 


##  아키텍처 개요 (Overview)

- 모바일 앱(React Native) ↔ 백엔드 API(Spring Boot)
- 데이터 저장: PostgreSQL
- 서버 운영: Docker 컨테이너
- 배포 자동화: Jenkins 컨테이너 기반 파이프라인 구성 


##  실행 (Getting Started)

> 아래 내용은 기본 구조 예시입니다. 실제 repo 구조/포트/환경변수에 맞게 수정하세요.

### 1) Backend 실행
- Spring Boot API 서버 실행
- PostgreSQL 연결 설정 필요

### 2) Frontend 실행
```bash
# cd /Crewcal/CrewCal-main/calendar-rn-ui
npx expo start -c

# run
npm run start
