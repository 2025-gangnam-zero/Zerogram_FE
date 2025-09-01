import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  sessionId: string | null;
  userName: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  sessionId: localStorage.getItem('sessionId'),
  userName: localStorage.getItem('userName'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ sessionId: string; userName: string }>) => {
      state.isLoggedIn = true;
      state.sessionId = action.payload.sessionId;
      state.userName = action.payload.userName;
      localStorage.setItem('sessionId', action.payload.sessionId);
      localStorage.setItem('userName', action.payload.userName);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.sessionId = null;
      state.userName = null;
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userName');
    },
    initializeAuth: (state) => {
      const sessionId = localStorage.getItem('sessionId');
      const userName = localStorage.getItem('userName');
      if (sessionId) {
        state.isLoggedIn = true;
        state.sessionId = sessionId;
        state.userName = userName;
      }
    },
  },
});

export const { login, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
