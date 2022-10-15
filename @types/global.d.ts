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
}

export {};
