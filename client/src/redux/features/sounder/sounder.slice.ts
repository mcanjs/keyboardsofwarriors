import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ISounderStore {
  soundType: 'founded' | 'victory' | 'defeat' | 'new' | undefined;
  canPlay: boolean;
}

const initialState: ISounderStore = {
  soundType: undefined,
  canPlay: false,
};

export const slice = createSlice({
  name: 'sounder',
  initialState,
  reducers: {
    changeSoundType(state, action: PayloadAction<'founded' | 'victory' | 'defeat' | 'new' | undefined>) {
      state.soundType = action.payload;
    },
    changeCanPlay(state, action: PayloadAction<boolean>) {
      state.canPlay = action.payload;
    },
  },
});

export const { changeSoundType, changeCanPlay } = slice.actions;
export default slice.reducer;
