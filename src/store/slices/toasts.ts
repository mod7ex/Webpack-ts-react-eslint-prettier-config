import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { type AppThunk } from '~/store';
import { queueJob } from '~/utils';

export interface Toast {
    id: Numberish;
    title?: string;
    content?: string;
    ttl?: number;
}

export const TTL = 6000;

const initialState: Toast[] = [];

export const counterSlice = createSlice({
    name: 'toasts',

    initialState,

    reducers: {
        add: (state, action: PayloadAction<Toast>) => {
            state.push(action.payload);
        },

        remove: (state, action: PayloadAction<Toast['id']>) => {
            state.removeBy(action.payload, 'id');
        },
    },
});

export const { add, remove } = counterSlice.actions;

export const scheduleRemoveThunk =
    ({ id, ttl }: Pick<Toast, 'id' | 'ttl'>): AppThunk =>
    (dispatch, getState) => {
        queueJob(() => {
            dispatch(remove(id));
        }, ttl ?? TTL);
    };

export default counterSlice.reducer;
