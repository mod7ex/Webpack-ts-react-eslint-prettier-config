// import { lazy } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => {};

export const isFunction = (v: unknown): v is TFunction => typeof v === 'function';

export const queueJob = (job: TFunction) => {
    setTimeout(job);
};

// const importView = (subreddit: string) => lazy(() => import(`./views/${subreddit}View`).catch(() => import(`./views/NullView`)));
