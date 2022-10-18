// import { lazy } from 'react';

export { default as uuidGen, type UUID } from '~/utils/uuid';

import { isArray, isMap } from '~/utils/types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => {};

export const isFunction = (v: unknown): v is TFunction => typeof v === 'function';

export const queueJob = (job: TFunction, tm = 0) => {
    // queue Macro Task, you can queue a Micro Task using the api queueMicrotask
    return setTimeout(job, tm);
};

export const sleep = (_tm = 1000) => {
    return new Promise((res) => {
        queueJob(res, _tm);
    });
};

export const is_empty = (v: unknown): v is undefined | [] => {
    if (v == undefined) return true;

    if (isArray(v)) return !!v.length;

    if (isMap(v)) return !!v.size;

    return false;
};

export const formattedJSON = (v: any) => {
    return JSON.stringify(v, null, 4);
};

// const importView = (subreddit: string) => lazy(() => import(`./views/${subreddit}View`).catch(() => import(`./views/NullView`)));
