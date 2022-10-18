import { type UUID } from '~/utils';
import logger from '../logger';
import RequestsMap from '~/helpers/requests/requests-map.json';

interface IMethods {
    GET: 'GET' | 'get';
    POST: 'POST' | 'post';
    PUT: 'PUT' | 'put';
    DELETE: 'DELETE' | 'delete';
}

type HttpMethod = IMethods[keyof IMethods];

type OmittedMethodOptions = Omit<RequestInit, 'method'>;
type OmittedBodyAndMethodOptions = Omit<OmittedMethodOptions, 'body'>;

type GetRequestOptions = OmittedBodyAndMethodOptions & { method: IMethods['GET'] };
type PostBasedRequestOptions = OmittedBodyAndMethodOptions & {
    method: Exclude<HttpMethod, IMethods['GET']>;
    body?: RequestInit['body'];
};

type RequestOptions = GetRequestOptions | PostBasedRequestOptions;

interface IRawRequest {
    base_url?: string;
    path?: string;
    timeout?: number;
    params?: Record<string, Numberish | boolean>;
    data?: Record<string, Numberish | boolean>;
}

interface IRequest extends IRawRequest {
    options?: RequestOptions;
}

/* ******************************************************************************************************************** */

let weak_map: WeakMap<RequestKey, IRequest> | undefined; // Key Order

const store_request = (payload: IRequest, key: RequestKey['key']) => {
    const _key = { key, timestamp: Date.now() };

    (weak_map ?? (weak_map = new Map())).set(_key, payload);

    return _key;
};

const get_request = (key: RequestKey) => {
    return weak_map?.get(key);
};

const delete_request = (key: RequestKey) => {
    return weak_map?.delete(key) ?? false;
};

const prepare_request = (payload: IRequest) => {
    return { base_url: DEFAULTS.BASE_URL, timeout: DEFAULTS.TIMEOUT, ...payload } as IRequest;
};

/* ******************************************************************************************************************** */

enum DEFAULTS {
    BASE_URL = 'https://gorest.co.in/public/v2',
    TIMEOUT = 3000,
}

const headers = (options?: object) => {
    return new Headers({
        'Content-Type': 'application/json',
        // 'Content-Length': options?.body?.toString().length,
    });
};

const DEFAULT_OPTIONS: RequestOptions = {
    method: 'GET',
};

/* ******************************************************************************************************************** */

/**
 *
 * we use fetch here we can use some other api like axios <package>
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 *
 */

export const createAbortion = (timeout: number) => {
    const controller = new AbortController();

    const id = setTimeout(() => controller.abort(), timeout);

    const clear = () => clearTimeout(id);

    return { controller, clear };
};

type Result<T> = Promise<
    | { success: false; error: any; message: string; key?: RequestKey }
    | { success: true; message: 'Success !'; data: T; response: Response; key?: RequestKey }
>;
export const request = async <T>({
    path = '',
    options,
    timeout = DEFAULTS.TIMEOUT,
    base_url = DEFAULTS.BASE_URL,
}: IRequest): Result<T> => {
    const end_point = `${base_url}/${path}`;

    const { controller, clear } = createAbortion(timeout);

    const _options = {
        signal: controller.signal,
        headers: headers(options),
        ...DEFAULT_OPTIONS,
        ...options,
    };

    try {
        const response = await fetch(end_point, _options);

        if (!response.ok) throw new TypeError('Network response was not OK');

        const data = (await response.json()) as T;

        // logger.log(response);
        logger.log(data);

        return { data, message: 'Success !', success: true, response };
    } catch (err: any) {
        const error = err;

        logger.error(error);

        return { error, message: error?.message ?? 'Something went wrong', success: false };
    } finally {
        clear();
    }
};

type RequestKey = { key: UUID<Numberish, Numberish>; timestamp: number }; // think about making the key a Symbol

/* ******************************************************************************************************************** */

export const memo_request = async <T>(payload: IRequest, key?: RequestKey['key']) => {
    const response = await request<T>(prepare_request(payload));

    if (key) response.key = store_request(payload, key); // if key is provided the payload will be stored

    return response;
};

export const resolve = async <T>(_key: RequestKey) => {
    const payload = get_request(_key);

    if (!payload) return;

    const response = await request<T>(payload);

    if (response.success) delete_request(_key);

    return response;
};

type ProxiedRequest = {
    [Key in HttpMethod]: <T>(
        payload: IRawRequest & {
            options?: Key extends IMethods['GET'] ? OmittedBodyAndMethodOptions : OmittedMethodOptions;
        },
        key?: RequestKey['key']
    ) => Result<T>;
};

export const http = new Proxy<ProxiedRequest>({} as ProxiedRequest, {
    get(_, method: HttpMethod) {
        return async <T>(payload: any, key?: RequestKey['key']) => {
            const { base_url, options, path, timeout } = prepare_request(payload);

            return memo_request<T>({ timeout, path, base_url, options: { ...options, method } }, key);
        };
    },
});

/* ******************************************************************************************************************** */

// Here is the thing y'all

export function isPlural<T extends string>(word: T) {
    return word[word.length - 1] === 's';
}

// prettier-ignore
type Plurify<T extends `${string}`> =
        T extends `${infer F}y`
        ? `${F}ies`
        : T extends `${string}s`
        ? T
        : `${T}s`; // add what you want depending on your use-case

export function plurify<T extends string>(word: T) {
    if (isPlural(word)) return word;

    let plural;

    if (!word) plural = 's';

    const _index = word.length - 1;
    const last_letter = word[_index];

    if (last_letter === 'y') plural = `${word.slice(0, _index)}ies`;
    else plural = `${word}s`;

    return plural as Plurify<T>;
}

type EntityKey = keyof typeof RequestsMap;

const entity_to_end_point = (entity: EntityKey | Plurify<EntityKey>) => {
    let end_point = Reflect.get(RequestsMap, entity); // put the url in the Map in case of complicated ones

    if (!end_point) end_point = plurify(entity); // otherwise we will just plurify what you provided (entity) & use it as end_point

    return end_point as string;
};

/* ******************************************************************************************************************** */

type ProxiedGETRequest = {
    [Key in string]: <T>(
        payload?: Omit<IRawRequest, 'path'> & { options?: OmittedBodyAndMethodOptions },
        key?: RequestKey['key']
    ) => Result<T>;
} & (<T>(payload: IRawRequest & { options?: OmittedBodyAndMethodOptions }, key?: RequestKey['key']) => Result<T>);

export const get = new Proxy<ProxiedGETRequest>({} as ProxiedGETRequest, {
    get(_, entity: EntityKey | Plurify<EntityKey>) {
        return async <T>(payload: any, key?: RequestKey['key']) => {
            const { base_url, options, timeout } = prepare_request(payload);

            const path = entity_to_end_point(entity);

            return http.GET<T>({ base_url, path, timeout, options }, key);
        };
    },

    apply(payload: any, key?: RequestKey['key']) {
        return http.GET(payload, key);
    },
});

type ProxiedPOSTRequest = {
    [Key in string]: <T>(
        payload?: Omit<IRawRequest, 'path'> & { options?: OmittedMethodOptions },
        key?: RequestKey['key']
    ) => Result<T>;
} & (<T>(payload: IRawRequest & { options?: OmittedMethodOptions }, key?: RequestKey['key']) => Result<T>);

export const post = new Proxy<ProxiedPOSTRequest>({} as ProxiedPOSTRequest, {
    get(_, entity: EntityKey | Plurify<EntityKey>) {
        return async <T>(payload: any, key?: RequestKey['key']) => {
            const { base_url, options, timeout } = prepare_request(payload);

            const path = entity_to_end_point(entity);

            return http.POST<T>({ base_url, path, timeout, options }, key);
        };
    },

    apply(payload: any, key?: RequestKey['key']) {
        return http.POST(payload, key);
    },
});

export const put = new Proxy<ProxiedPOSTRequest>({} as ProxiedPOSTRequest, {
    get(_, entity: EntityKey | Plurify<EntityKey>) {
        return async <T>(payload: any, key?: RequestKey['key']) => {
            const { base_url, options, timeout } = prepare_request(payload);

            const path = entity_to_end_point(entity);

            return http.PUT<T>({ base_url, path, timeout, options }, key);
        };
    },

    apply(payload: any, key?: RequestKey['key']) {
        return http.PUT(payload, key);
    },
});

export const drop = new Proxy<ProxiedPOSTRequest>({} as ProxiedPOSTRequest, {
    get(_, entity: EntityKey | Plurify<EntityKey>) {
        return async <T>(payload: any, key?: RequestKey['key']) => {
            const { base_url, options, timeout } = prepare_request(payload);

            const path = entity_to_end_point(entity);

            return http.DELETE<T>({ base_url, path, timeout, options }, key);
        };
    },

    apply(payload: any, key?: RequestKey['key']) {
        return http.DELETE(payload, key);
    },
});

/*

const fetcher = async <T>() => {
    const users = await get.users<T>();

    const user = await post.user<T>({
        options: {
            body: JSON.stringify({
                name: 'Mourad',
                email: 'moudex@mail.com',
            }),
        },
    });

    return {
        users,
        user,
    };
};

*/

addEventListener('fetch', (event) => {
    console.log(event); // use it to ex: set a token ...
});

/**
 * add pick option
 */
