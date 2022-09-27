declare global {
    interface Window {
        GEN: string;
    }

    declare type TFunction = (...args: any[]) => any;
}

export {};
