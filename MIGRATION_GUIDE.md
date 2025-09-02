# Redux에서 Zustand로의 마이그레이션 가이드

## 변경 사항 요약

### 1. 의존성 변경

- **제거됨**: `@reduxjs/toolkit`, `react-redux`
- **추가됨**: `zustand`

### 2. 스토어 구조 변경

#### 기존 Redux 구조

```
src/store/
├── index.ts          # Redux store 설정
├── authSlice.ts      # Redux Toolkit slice
└── userSlice.ts      # Redux Toolkit slice
```

#### 새로운 Zustand 구조

```
src/store/
├── index.ts          # Zustand stores export
├── authStore.ts      # Zustand store
└── userStore.ts      # Zustand store
```

### 3. Hooks 변경

#### 기존 Redux hooks

```typescript
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { useSelector, useDispatch } from "react-redux";

const dispatch = useAppDispatch();
const { isLoggedIn } = useAppSelector((state) => state.auth);
```

#### 새로운 Zustand hooks

```typescript
import { useAuthStore, useUserStore } from "../store";

const { isLoggedIn, login, logout } = useAuthStore();
const { name, fetchUserInfo } = useUserStore();
```

### 4. 주요 컴포넌트 변경

#### App.tsx

- Redux Provider 제거
- Zustand hooks 직접 사용

#### LoginPage.tsx

- `useAppDispatch` → `useUserStore`, `useAuthStore`
- `dispatch(action)` → `action()`

#### Header.tsx

- `useAppSelector`, `useAppDispatch` → `useAuthStore`
- `dispatch(action)` → `action()`

#### MyPage.tsx

- `useAppSelector`, `useAppDispatch` → `useUserStore`
- `dispatch(action)` → `action()`

## Zustand 사용법

### 1. 스토어 생성

```typescript
import { create } from "zustand";

export const useStore = create<State & Actions>((set, get) => ({
  // State
  count: 0,

  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### 2. 컴포넌트에서 사용

```typescript
const { count, increment } = useStore();

// 또는 선택적으로 상태만 가져오기
const count = useStore((state) => state.count);
```

### 3. 지속성 (Persistence)

```typescript
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({ ... }),
    {
      name: 'storage-key',
      partialize: (state) => ({ ... }),
    }
  )
);
```

## 장점

1. **번들 크기 감소**: Redux Toolkit + React-Redux 대비 더 작은 번들
2. **간단한 API**: 보일러플레이트 코드 감소
3. **TypeScript 지원**: 더 나은 타입 추론
4. **성능**: 불필요한 리렌더링 방지
5. **개발자 경험**: 더 직관적인 API

## 주의사항

1. **마이그레이션 완료**: 모든 컴포넌트에서 Redux hooks 사용 금지
2. **새로운 기능**: Zustand의 `persist` 미들웨어 활용
3. **타입 안전성**: TypeScript 인터페이스 정의 유지
4. **테스트**: 기존 기능이 정상 작동하는지 확인

## 다음 단계

1. 프로젝트 빌드 및 테스트
2. 기존 기능 동작 확인
3. 새로운 Zustand 기능 활용 검토
4. 성능 최적화 고려
