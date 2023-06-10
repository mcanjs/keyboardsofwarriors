import { configureStore } from '@reduxjs/toolkit';

// Reducers
import matchmakerReducer from './features/matchmaker/matchmaker.slice';

export const store = configureStore({
  reducer: {
    matchmakerReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
