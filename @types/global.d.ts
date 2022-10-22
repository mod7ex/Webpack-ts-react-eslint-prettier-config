declare global {
    interface Window {
        GEN: string;
    }

    interface Array {
        removeBy<T extends object, K extends keyof T>(this: T[], value: T[K], key: K): T[];
    }

    declare type TFunction = (...args: any[]) => any;

    type TEmpty = undefined | null;

    declare type Numberish = number | string;

    declare type NullableNumberish = Numberish | undefined | null;

    declare type TupleUnion<U extends string, R extends any[] = []> = {
        [S in U]: Exclude<U, S> extends never ? [...R, S] : TupleUnion<Exclude<U, S>, [...R, S]>;
    }[U];
}

export {};
