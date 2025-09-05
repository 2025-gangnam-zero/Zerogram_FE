# src 내부 폴더 상세 설명

## 📁 api/: 서버와의 통신 창구

역할: 백엔드 서버와 데이터를 주고받는 모든 코드를 모아두는 곳입니다.

예시 코드:

Axios나 Fetch API 기본 설정 (예: axios.create로 baseURL, timeout 설정)

getPosts(), createComment(commentData) 와 같이 각 API 요청을 보내는 함수들

서버에서 받은 데이터를 앱에서 사용하기 좋은 형태로 가공하는 로직

## 📁 assets/: 이미지, 폰트 등 리소스 창고

역할: 애플리케이션에서 사용하는 정적 파일들을 보관합니다.

예시 코드:

로고 이미지 (logo.png), 아이콘 (icon.svg)

커스텀 폰트 파일 (font.woff2)

## 📁 components/: 재사용 가능한 UI 부품 (레고 블록)

역할: 여러 페이지나 다른 컴포넌트에서 공통으로 사용될 UI 조각들을 만듭니다. '바보 컴포넌트(Dumb Component)'라고도 부르며, 자체적으로 상태나 로직을 갖기보다는 props로 데이터를 받아 화면에 그려주는 역할에 집중합니다.

예시 코드:

Button.tsx, Input.tsx, Modal.tsx, Card.tsx

각 컴포넌트 폴더 안에 index.tsx (컴포넌트 로직), style.ts (스타일)을 같이 두기도 합니다.

## 📁 constants/: 변하지 않는 값들의 저장소

역할: 앱 전체에서 공통적으로 사용되지만 변하지 않는 상수 값들을 정의합니다. "마법의 숫자"나 "마법의 문자열"을 코드에서 없애주어 실수를 줄이고 가독성을 높입니다.

예시 코드:

API 경로: export const API_ROUTES = { POSTS: '/posts' };

색상 코드: export const COLORS = { PRIMARY: '#6200EE' };

오류 메시지: export const ERROR_MESSAGES = { INVALID_EMAIL: '이메일 형식이 올바르지 않습니다.' };

## 📁 contexts/: 전역 상태 공유 공간 (Context API)

역할: React의 Context API를 사용해 여러 컴포넌트가 공유해야 하는 전역 상태를 관리합니다. props를 여러 단계로 내려주는 'prop drilling'을 피하고 싶을 때 유용합니다.

예시 코드:

AuthContext.tsx: 사용자의 로그인 상태(로그인 여부, 유저 정보)를 관리

ThemeContext.tsx: 다크 모드/라이트 모드 테마 상태를 관리

## 📁 hooks/: 재사용 가능한 로직 묶음 (커스텀 훅)

역할: 여러 컴포넌트에서 반복적으로 사용되는 로직을 함수 형태로 분리하여 재사용성을 높입니다. 훅의 이름은 항상 use로 시작해야 합니다.

예시 코드:

useFetch(url): API 요청을 보내고 로딩, 데이터, 에러 상태를 반환하는 훅

useWindowSize(): 브라우저 창의 크기를 감지하는 훅

useInputs(initialForm): 여러 입력 폼의 상태를 쉽게 관리하는 훅

## 📁 mocks/: 개발 및 테스트를 위한 가짜 데이터

역할: 아직 백엔드 API가 준비되지 않았을 때 개발을 계속하거나, 테스트를 위해 일관된 데이터가 필요할 때 사용하는 가짜(mock) 데이터와 API를 정의합니다.

예시 코드:

MSW(Mock Service Worker) 핸들러: 실제 API 요청을 가로채 가짜 응답을 보내줌

user.json: 테스트용 가짜 유저 정보 배열

## 📁 pages/: 사용자가 보는 각각의 페이지

역할: 애플리케이션의 각 페이지를 구성하는 컴포넌트입니다. 보통 하나의 URL 주소에 하나의 페이지 컴포넌트가 매칭됩니다. '스마트 컴포넌트(Smart Component)'라고도 불리며, 필요한 데이터를 api나 hooks를 통해 직접 가져오고, components 폴더의 UI 부품들을 조립하여 하나의 완전한 페이지를 만듭니다.

예시 코드:

HomePage.tsx, LoginPage.tsx, ProfilePage.tsx, PostDetailPage.tsx

## 📁 store/: 복잡한 전역 상태 관리소 (Redux, Zustand 등)

역할: contexts보다 더 복잡하고, 앱의 여러 곳에서 자주 변경되는 중요한 상태들을 관리합니다. Redux, Zustand, Recoil 같은 상태 관리 라이브러리의 코드가 위치합니다.

예시 코드:

Redux: slices, reducers, actions, store 설정 코드

Zustand: create 함수를 사용한 스토어 생성 코드

## 📁 styles/: 앱 전반의 스타일링

역할: 특정 컴포넌트에 종속되지 않는 전역 스타일이나, 여러 컴포넌트에서 공유하는 스타일 변수, 테마 등을 정의합니다.

예시 코드:

GlobalStyle.ts: CSS 리셋, 기본 폰트 및 배경색 등 전역 스타일 정의

theme.ts: styled-components나 Emotion에서 사용할 테마 객체 (색상, 폰트 크기, 간격 등)

## 📁 types/: TypeScript 타입 정의 창고

역할: 프로젝트 전반에서 공통으로 사용되는 TypeScript 타입을 모아두는 곳입니다. 타입을 중앙에서 관리하여 일관성을 유지하고 재사용하기 좋습니다.

예시 코드:

user.ts: interface User { id: number; name: string; }

post.ts: type Post = { ... };

API 응답 데이터 타입 정의

## 📁 utils/: 잡다하지만 유용한 함수 모음

역할: 특정 도메인에 속하지 않는 순수 함수(utility functions)들을 모아둡니다. 어떤 프로젝트에 가져다 써도 될 만한 일반적인 함수들이 여기에 속합니다.

예시 코드:

formatDate(date): 날짜를 원하는 형식의 문자열로 변환하는 함수

calculatePrice(price, discount): 가격을 계산하는 함수

validators.ts: 이메일 형식, 비밀번호 규칙 등을 검증하는 함수들
