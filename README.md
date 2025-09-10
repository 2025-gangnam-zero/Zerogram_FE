# Zerogram

> 운동인과 입문자를 위한 통합 플랫폼 서비스

Zerogram은 헬스와 러닝 열풍 속에서 운동인과 입문자를 위한 통합 플랫폼 서비스입니다. 체계적인 운동 기록, 칼로리 추적, 운동 메이트 매칭, 데이터 분석 기능을 제공하여 건강한 운동 라이프스타일을 지원합니다.

## 🚀 주요 기능

### 📝 운동 & 식단 일지

- **달력 기반 운동 기록**: 직관적인 달력 인터페이스로 운동 일정 관리
- **상세한 운동 내용 작성**: 러닝과 헬스 운동을 구분하여 체계적으로 기록
- **칼로리 추적**: 운동별 소모 칼로리 기록 및 관리
- **피드백 시스템**: 운동 후 소감과 감상 기록

### 🏃‍♂️ 러닝 기능

- **거리 및 페이스 기록**: km 단위 거리와 분:초/km 페이스 기록
- **운동 시간 추적**: 정확한 운동 시간 측정
- **러닝 데이터 분석**: Chart.js를 활용한 시각적 데이터 제공

### 💪 헬스 기능

- **부위별 운동 루틴**: 가슴, 등, 다리 등 부위별 운동 관리
- **세트/횟수/무게 기록**: 정확한 운동 강도 추적
- **다양한 운동 종목**: 벤치프레스, 스쿼트 등 다양한 헬스 운동 지원

### 🤝 운동 메이트 구하기

- **지역별 필터링**: 강남구, 서초구 등 지역별 운동 파트너 찾기
- **종목별 필터링**: 헬스, 러닝, 테니스 등 관심 종목별 찾기
- **모집글 작성 및 참여**: 운동 그룹 모집 및 참여 기능
- **댓글 및 소통**: 운동 파트너와의 소통 기능

### 👤 사용자 관리

- **다양한 로그인 옵션**: 이메일/비밀번호, Google OAuth, 카카오 OAuth
- **프로필 관리**: 닉네임, 프로필 이미지, 개인정보 관리
- **마이페이지**: 개인 활동 내역 및 설정 관리

### 🛡️ 안전한 환경

- **신고 시스템**: 부적절한 게시물 신고 기능
- **관리자 모니터링**: 안전한 커뮤니티 운영
- **세션 관리**: 안전한 사용자 인증 및 세션 관리

## 🛠️ 기술 스택

### Frontend

- **React 19.1.1** - 사용자 인터페이스 구축
- **TypeScript 4.9.5** - 타입 안전성 보장
- **Styled Components 6.1.19** - CSS-in-JS 스타일링
- **React Router DOM 7.8.2** - 클라이언트 사이드 라우팅
- **Zustand 5.0.8** - 상태 관리
- **Chart.js 4.5.0** - 데이터 시각화
- **React Calendar 6.0.0** - 달력 컴포넌트

### Backend Integration

- **Axios 1.11.0** - HTTP 클라이언트
- **RESTful API** - 백엔드 서버와의 통신

### Development Tools

- **Create React App** - 프로젝트 설정 및 빌드
- **ESLint** - 코드 품질 관리
- **TypeScript** - 정적 타입 검사

## 📁 프로젝트 구조

```
src/
├── api/                    # API 통신 모듈
│   ├── auth.ts            # 인증 관련 API
│   └── workout.ts         # 운동 관련 API
├── components/            # 재사용 가능한 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── workout/          # 운동 관련 컴포넌트
│       ├── WorkoutForm.tsx
│       ├── WorkoutList.tsx
│       └── WorkoutDetailModal.tsx
├── pages/                # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── MyPage.tsx
│   └── WorkoutLogPage.tsx
├── store/                # 상태 관리 (Zustand)
│   ├── authStore.ts      # 인증 상태 관리
│   ├── userStore.ts      # 사용자 정보 관리
│   └── workoutStore.ts   # 운동 데이터 관리
├── types/                # TypeScript 타입 정의
│   ├── common.ts
│   ├── user.ts
│   └── workout.ts
├── constants/            # 상수 정의
│   ├── api.ts
│   ├── auth.ts
│   └── ui.ts
├── utils/                # 유틸리티 함수
│   ├── auth.ts
│   ├── validation.ts
│   └── error.ts
└── styles/               # 전역 스타일
    └── GlobalStyle.ts
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 16.0.0 이상
- npm 7.0.0 이상

### 설치 및 실행

1. **저장소 클론**

   ```bash
   git clone <repository-url>
   cd client
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **환경 변수 설정**

   ```bash
   # .env 파일 생성
   REACT_APP_API_BASE_URL=http://your-backend-url:4000
   ```

4. **개발 서버 실행**

   ```bash
   npm start
   ```

   브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

5. **프로덕션 빌드**
   ```bash
   npm run build
   ```

## 📱 사용법

### 1. 회원가입 및 로그인

- 이메일/비밀번호로 회원가입
- Google 또는 카카오 계정으로 소셜 로그인

### 2. 운동 기록하기

- 달력에서 원하는 날짜 선택
- "일지 작성" 버튼 클릭
- 러닝 또는 헬스 운동 선택
- 운동 세부사항 입력 (시간, 칼로리, 거리, 페이스 등)
- 피드백 작성 후 저장

### 3. 운동 내역 확인

- 달력에서 운동한 날짜 확인
- 운동 상세 내역 조회
- 월별 운동 데이터 분석

### 4. 프로필 관리

- 마이페이지에서 개인정보 수정
- 프로필 이미지 업로드
- 비밀번호 변경

## 🔧 개발 가이드

### 상태 관리 (Zustand)

이 프로젝트는 Redux에서 Zustand로 마이그레이션되었습니다. 자세한 내용은 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)를 참고하세요.

### API 통신

- 모든 API 호출은 `src/api/` 디렉토리에서 관리
- Axios 인터셉터를 통한 자동 인증 헤더 추가
- 에러 핸들링 및 로깅 시스템 구축

### 스타일링

- Styled Components를 사용한 CSS-in-JS 방식
- 일관된 디자인 시스템을 위한 상수 정의 (`src/constants/ui.ts`)
- 반응형 디자인 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Zerogram**과 함께 건강한 운동 라이프를 시작하세요! 💪
