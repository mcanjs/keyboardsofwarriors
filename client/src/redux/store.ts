import { configureStore } from '@reduxjs/toolkit';

// Reducers
import matchmakerReducer from './features/matchmaker/matchmaker.slice';
import sounderReducer from './features/sounder/sounder.slice';

export const store = configureStore({
  reducer: {
    matchmakerReducer,
    sounderReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
