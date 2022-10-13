// import { lazy } from 'react';

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

export const uuidGen = (payload = 'some-random-string') => {
    let state = 0;

    return () => {
        state++;
        return `uid-${Date.now()}-${state}-${payload}`;
    };
};

// const importView = (subreddit: string) => lazy(() => import(`./views/${subreddit}View`).catch(() => import(`./views/NullView`)));
