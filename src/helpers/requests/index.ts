import { type UUID } from '~/utils';
import logger from '../logger';
import {
    createAbortion,
    uuid,
    headers as default_headers,
    payload_to_query,
    path_join,
    pick,
} from '~/helpers/requests/utils';
import RequestsMap from '~/helpers/requests/requests-map.json';

/* ******************************************************************************************************************** */

interface IMethods {
    GET: 'GET' | 'get';
    POST: 'POST' | 'post';
    PUT: 'PUT' | 'put';
    DELETE: 'DELETE' | 'delete';
}

type HttpMethod = IMethods[keyof IMethods];

type RequestKey = { key: UUID<Numberish, Numberish>; timestamp: number }; // think about making the key a Symbol

type TData = NonNullable<RequestInit['body']>;

interface IRawRequest<M extends HttpMethod> {
    base_url?: string;
    path?: string;
    timeout?: number;
    params?: Record<string, Numberish | boolean>;
    key?: RequestKey['key'];
    options?: RequestInit;
    method?: M;
}

type RawRequest = IRawRequest<IMethods['GET']> | (IRawRequest<Exclude<HttpMethod, IMethods['GET']>> & { data?: TData });

/* ******************************************************************************************************************** */

enum DEFAULTS {
    BASE_URL = 'https://gorest.co.in/public/v2',
    TIMEOUT = 3000,
}

/* ******************************************************************************************************************** */

let requestsMap: WeakMap<RequestKey, RawRequest> | undefined; // Key Order

const store_request = (payload: RawRequest, key: RequestKey['key'] = uuid()) => {
    const _key = { key, timestamp: Date.now() };

    (requestsMap ?? (requestsMap = new Map())).set(_key, payload);

    return _key;
};

const get_request = (key: RequestKey) => {
    return requestsMap?.get(key);
};

const delete_request = (key: RequestKey) => {
    return requestsMap?.delete(key) ?? false;
};

const prepare_request = (payload: RawRequest) => {
    return { base_url: DEFAULTS.BASE_URL, timeout: DEFAULTS.TIMEOUT, ...payload } as RawRequest;
};

/* ******************************************************************************************************************** */

/**
 *
 * we use fetch here we can use some other api like axios <package>
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 *
 */

type Result<T, E = any, P extends (keyof T)[] = []> =
    | { success: false; error: E; message: string; key?: RequestKey }
    | { success: true; message: 'Success !'; data: T | Pick<T, P[number]>; response: Response; key?: RequestKey };

export const request = async <T extends object, E, P extends (keyof T)[] = []>(
    payload: RawRequest,
    pick_keys?: P
): Promise<Result<T, E, P>> => {
    const { method, base_url, path, timeout, params, key, options } = payload;

    const end_point = path_join(base_url ?? DEFAULTS.BASE_URL, path ?? '');

    const query = params ? payload_to_query(params) : '';

    const { controller, clear } = createAbortion(timeout ?? DEFAULTS.TIMEOUT);

    let _key;

    if (key) {
        // store the original payload
        _key = store_request(payload);
    }

    const headers = {
        ...default_headers(options),
        ...options?.headers,
    };

    const _options: RequestInit = {
        // keep same order !
        signal: controller.signal,
        method: method ?? 'GET',
        // @ts-ignore
        body: payload?.data,
        ...options,
        headers,
    };

    try {
        const response = await fetch(end_point + query, _options);

        if (!response.ok) throw new TypeError('Network response was not OK');

        const data = (await response.json()) as T;

        // logger.log(response);
        logger.log(data);

        return { data: pick<T, P>(data, pick_keys ?? []), message: 'Success !', success: true, response, key: _key };
    } catch (err: any) {
        const error = err;

        logger.error(error);

        return { error, message: error?.message ?? 'Something went wrong', success: false, key: _key };
    } finally {
        clear();
    }
};

/* ******************************************************************************************************************** */

export const memo_request = async <T>(payload: TRequest, key?: RequestKey['key']) => {
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
        payload: RawRequest & {
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
        payload?: Omit<RawRequest, 'path'> & { options?: OmittedBodyAndMethodOptions },
        key?: RequestKey['key']
    ) => Result<T>;
} & (<T>(payload: RawRequest & { options?: OmittedBodyAndMethodOptions }, key?: RequestKey['key']) => Result<T>);

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
        payload?: Omit<RawRequest, 'path'> & { options?: OmittedMethodOptions },
        key?: RequestKey['key']
    ) => Result<T>;
} & (<T>(payload: RawRequest & { options?: OmittedMethodOptions }, key?: RequestKey['key']) => Result<T>);

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
