import { configureStore } from '@reduxjs/toolkit';

// Reducers
import matchmakerReducer from './features/matchmaker/matchmaker.slice';
import sounderReducer from './features/sounder/sounder.slice';
import improveReducer from './features/improve/improve.slice';

export const store = configureStore({
  reducer: {
    matchmakerReducer,
    sounderReducer,
    improveReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
