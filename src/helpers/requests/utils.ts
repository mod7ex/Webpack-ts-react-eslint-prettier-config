import { uuidGen } from '~/utils';

interface AbortionOptions {
    timeout: number;
    auto?: boolean;
    reason?: any;
}

export const createAbortion = ({ timeout, auto = true, reason }: AbortionOptions) => {
    const controller = new AbortController();

    let id: NodeJS.Timeout | undefined;

    const kill = (_reason?: any) => controller.abort(_reason ?? reason);

    const schedule = (_timeout?: number, _reason?: any) => {
        console.log(_timeout, timeout);
        id = setTimeout(() => kill(_reason ?? reason), _timeout ?? timeout);
    };

    if (auto) schedule();

    const clear = () => clearTimeout(id);

    return { controller, clear, schedule, kill };
};

export const headers = (options?: object) => {
    return new Headers({
        'Content-Type': 'application/json',
        // 'Content-Length': options?.body?.toString().length,
    });
};

export const uuid = uuidGen('request');

const trim_slash = (str: string): string => {
    const len = str.length;

    if (str.startsWith('/')) return trim_slash(str.slice(1, len));

    if (str.endsWith('/')) return trim_slash(str.slice(0, len - 1));

    return str;
};

export const path_join = (...args: string[]) => {
    return trim_slash(
        args.reduce((prev, curr) => {
            return `${prev}/${trim_slash(curr)}`;
        }, '')
    );
};

export const payload_to_query = (payload: Record<string, Numberish | boolean>, init = '?') => {
    const query = Object.entries(payload)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return `${query ? init : ''}${query}`;
};

export const pick = <T extends object, K extends keyof T>(payload: T, keys: K[]) => {
    return keys.reduce((prev, key) => {
        return {
            ...prev,
            [key]: payload[key],
        };
    }, {}) as Pick<T, K>;
};
