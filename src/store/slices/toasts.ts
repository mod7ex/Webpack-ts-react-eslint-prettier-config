import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { queueJob } from '~/utils';

export interface Toast {
    id: Numberish;
    title?: string;
    content: string;
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

            // queueJob(() => {
            //     // console.log(counterSlice.actions.remove(action.payload.id));
            //     console.log(action.payload.id);
            //     // counterSlice.caseReducers.remove(state, { ...action, payload: action.payload.id });
            // }, action.payload.ttl ?? TTL);
        },

        remove: (state, action: PayloadAction<Toast['id']>) => {
            state.removeBy(action.payload, 'id');
        },
    },
});

export const { add, remove } = counterSlice.actions;

export default counterSlice.reducer;
