// import { lazy } from 'react';

import { isArray, isMap, isWeakMap } from '~/utils/types';

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

/**
 * Fix Type infer issue
 */
export type UUID<T extends Numberish> = `uid-${number}-${number}-${T}`;
export const uuidGen = <T extends Numberish>(payload: T) => {
    let state = 0;

    return <O extends Numberish | undefined>(on_the_fly_payload?: O) => {
        state++;
        return `uid-${Date.now()}-${state}-${payload ?? on_the_fly_payload}` as UUID<O extends undefined ? T : O>;
    };
};

export const createAbortion = (timeout: number) => {
    const controller = new AbortController();

    const id = setTimeout(() => controller.abort(), timeout);

    const clear = () => clearTimeout(id);

    return { controller, clear };
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
