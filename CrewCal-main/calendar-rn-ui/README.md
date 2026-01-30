# Calendar RN UI (Expo)

지금까지 만든 캘린더 UI를 **React Native(Expo)** 로 옮긴 **UI 전용 앱** 프로젝트입니다.

## 포함 기능 (UI/state only)
- Login / Logout
- Month 뷰 (6x7 그리드)
- Week 뷰 (시간축 + 스크롤 + 이벤트 블록)
- New Calendar 모달
- Share Calendar 모달
- Event Create/Edit 모달 (Save/Delete)

> 서버는 연결하지 않았고, 각 TODO 위치에 API 붙이면 됩니다.

## 실행
```bash
npm install
npx expo start
```

- iOS 시뮬레이터: `i`
- Android 에뮬레이터: `a`
- Expo Go로 실기기 테스트도 가능

## 조작
- Month 뷰: 날짜 칸 **길게 누르기** → New Event, 이벤트 탭 → Edit Event
- Week 뷰: 빈 시간대 **탭/길게** → 해당 시간으로 New Event, 이벤트 탭 → Edit Event
- 상단: Month/Week 전환, Today, Prev/Next, Logout
- RN 모바일 UX에 맞게, 캘린더 토글/새 캘린더/공유는 상단 아래 **가로 스트립**으로 제공

## 서버 연결 포인트
- Auth: `src/auth/AuthContext.tsx`
- Event/Calendar/Share CRUD: `src/screens/CalendarScreen.tsx`
