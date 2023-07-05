import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IMatchmakerStore {
  isMatchFounded: boolean;
  isUserAccepted: boolean;
}

const initialState: IMatchmakerStore = {
  isMatchFounded: false,
  isUserAccepted: false,
};

export const slice = createSlice({
  name: "matchmaker",
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

export const { changeIsMatchFounded, changeIsUserAccepted } = slice.actions;
export default slice.reducer;
