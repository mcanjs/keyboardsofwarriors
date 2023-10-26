import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IImproveStore {
  words: number;
  time: number;
  isTime: boolean;
  restartRequest: boolean;
}

const initialState: IImproveStore = {
  words: 50,
  time: 120,
  isTime: false,
  restartRequest: false,
};

export const slice = createSlice({
  name: 'improve',
  initialState,
  reducers: {
    changeWords(state, action: PayloadAction<number>) {
      state.words = action.payload;
    },
    changeTime(state, action: PayloadAction<number>) {
      state.time = action.payload;
    },
    changeIsTime(state, action: PayloadAction<boolean>) {
      state.isTime = action.payload;
    },
    changeRestartRequest(state, action: PayloadAction<boolean>) {
      state.restartRequest = action.payload;
    },
  },
});

export const { changeWords, changeTime, changeIsTime, changeRestartRequest } = slice.actions;
export default slice.reducer;
