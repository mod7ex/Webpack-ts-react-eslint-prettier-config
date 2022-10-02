import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
    name: 'modal',

    initialState: {
        up: false,
    },

    reducers: {
        up: (state) => {
            state.up = true;
        },

        down: (state) => {
            state.up = false;
        },

        toggle: (state, action: PayloadAction<boolean | undefined>) => {
            state.up = action.payload ?? !state.up;
        },
    },
});

export const { up, down, toggle } = counterSlice.actions;

export default counterSlice.reducer;
