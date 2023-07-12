import { IMatcherFoundedData } from "@/src/interfaces/socket/matcher.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IMatchmakerStore {
  isMatchFounded: boolean;
  isUserAccepted: boolean;
  matchFoundedData: undefined | IMatcherFoundedData;
}

const initialState: IMatchmakerStore = {
  isMatchFounded: false,
  isUserAccepted: false,
  matchFoundedData: undefined,
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
    changeMatchFoundedData(
      state,
      action: PayloadAction<undefined | IMatcherFoundedData>
    ) {
      state.matchFoundedData = action.payload;
    },
    matchmakerDefaultStates(state) {
      state.isMatchFounded = false;
      state.isUserAccepted = false;
      state.matchFoundedData = undefined;
    },
  },
});

export const {
  changeIsMatchFounded,
  changeIsUserAccepted,
  changeMatchFoundedData,
  matchmakerDefaultStates,
} = slice.actions;
export default slice.reducer;
