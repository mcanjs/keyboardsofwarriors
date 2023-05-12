import { configureStore } from '@reduxjs/toolkit';

// Reducers
import matchmakingReducer from './features/matchmakingSlice';

export const store = configureStore({
  reducer: {
    matchmakingReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
