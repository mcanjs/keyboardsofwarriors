import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IMatchmakingStore {
  isMatchFounded: boolean;
  isUserAccepted: boolean;
}

const initialState: IMatchmakingStore = {
  isMatchFounded: false,
  isUserAccepted: false,
};

export const matchmakingSlice = createSlice({
  name: 'matchmaking',
  initialState,
  reducers: {
    changeIsMatchFounded(state, action: PayloadAction<boolean>) {
      state.isMatchFounded = action.payload;
    },
    changeIsUserAccepted(state, action: PayloadAction<boolean>) {
      state.isUserAccepted = action.payload;
    },
  },
});

export const { changeIsMatchFounded, changeIsUserAccepted } = matchmakingSlice.actions;
export default matchmakingSlice.reducer;
