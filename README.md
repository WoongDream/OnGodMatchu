# OnGodMatchu

이미지/텍스트 기반 주관식 퀴즈를 만들고 공유하는 서비스.

> 백엔드: [WoongDream/OnGodMatchu-BE](https://github.com/WoongDream/OnGodMatchu-BE)  
> 운영 도메인: [ongodmatchu.com](https://ongodmatchu.com)  
> 배포 가이드: [DEPLOYMENT.md](./docs/deployment.md)  
> 이미지 관리: [IMAGE_MANAGEMENT.md](./docs/image-management.md)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript |
| 스타일 | Emotion (styled) |
| 라우팅 | React Router v7 |
| 데이터 패칭 | SWR |
| 상태관리 | Zustand |
| HTTP | Axios |
| 빌드 | Vite |

## 화면 구조

```
/                   → 메인 (퀴즈 목록 + 카테고리 필터)
/quiz/:id           → 퀴즈 풀기
/quiz/:id/result    → 결과 화면
/quiz/create        → 퀴즈 만들기
/login              → 로그인
/signup             → 회원가입
```

## 프로젝트 구조

```
src/
├── api/                      # axios 인스턴스 + API 함수
├── components/               # 공통 컴포넌트 (Button, Input, Layout 등)
├── features/                 # 페이지별 UI 구성 컴포넌트
│   ├── quiz-list/            # 메인 (퀴즈 목록 + 카테고리 필터)
│   ├── quiz-play/            # 퀴즈 풀기
│   ├── quiz-result/          # 결과 화면
│   ├── quiz-create/          # 퀴즈 만들기
│   └── auth/                 # 로그인 / 회원가입
├── hooks/                    # 커스텀 훅
├── pages/                    # 라우트 단위 페이지 컴포넌트
├── store/                    # Zustand 스토어
├── types/                    # 공통 타입 정의
├── App.tsx
└── main.tsx
```

## 주요 명령어

```bash
npm run dev        # 개발 서버
npm run lint       # ESLint 검사
npm run lint:fix   # ESLint 자동 수정
npm run format     # Prettier 포맷
npm run build      # 프로덕션 빌드
```

## 컨벤션

[CONVENTIONS.md](./CONVENTIONS.md) 참고
