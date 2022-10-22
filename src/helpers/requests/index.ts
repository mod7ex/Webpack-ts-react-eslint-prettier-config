import { type UUID } from '~/utils';
import logger from '../logger';
import {
    createAbortion,
    uuid,
    headers as default_headers,
    payload_to_query,
    path_join,
    pick,
    plurify,
    type Plurify,
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

export const store_request = (payload: RawRequest, key: RequestKey['key'] = uuid()) => {
    const _key = { key, timestamp: Date.now() };

    (requestsMap ?? (requestsMap = new Map())).set(_key, payload);

    return _key;
};

export const get_request = (key: RequestKey) => {
    return requestsMap?.get(key);
};

export const delete_request = (key: RequestKey) => {
    return requestsMap?.delete(key) ?? false;
};

export const prepare_request = (payload?: RawRequest) => {
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

type Data = Record<string, any>;

type Result<T extends Data, E = any> =
    | { success: false; error: E; message: string; key?: RequestKey }
    | {
          data: T;
          success: true;
          message: 'Success !';
          response: Response;
          key?: RequestKey;
      };

export const raw_request = async <T extends Data, E = any>(payload?: RawRequest): Promise<Result<T, E>> => {
    const { method, base_url, path, timeout, params, key, options } = prepare_request(payload);

    const end_point = path_join(base_url!, path ?? '');

    const query = params ? payload_to_query(params) : '';

    const { controller, clear } = createAbortion({
        timeout: timeout!,
        reason: 'Request timeout exceeded',
    });

    let _key;

    if (key) {
        // store the original payload
        _key = store_request(payload!);
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

        const data = <T>await response.json();

        // logger.log(response);
        logger.log(data);

        return {
            data,
            message: 'Success !',
            success: true,
            response,
            key: _key,
        };
    } catch (err: any) {
        const error = err;

        logger.error('[request error]: ', error);

        return { error, message: error?.message ?? 'Something went wrong', success: false, key: _key };
    } finally {
        clear();
    }
};

export const request = async <T extends Data, E = any>(payload?: RawRequest) => {
    const result = await raw_request<T, E>(payload);

    if (!result.success) return result;

    return {
        ...result,
        /**
         *
         * @param pick_keys
         * @returns object containing only the picked keys
         * @if no argument is passed, it returns the same copy
         * @if the argument is an empty array, it returns an empty plain object
         */
        pick: <P extends keyof T>(pick_keys?: P[]) => {
            const data = result.data;

            return (pick_keys ? pick(data, pick_keys) : data) as keyof T extends P ? T : Pick<T, P>;
        },
    };
};

/* ******************************************************************************************************************** */

export const createRequest = <T extends Data | undefined = undefined, E = undefined>(payload?: RawRequest) => {
    const { controller, clear, schedule, kill } = createAbortion({
        timeout: payload?.timeout ?? (DEFAULTS.TIMEOUT as number),
        auto: false,
    });

    /**
     * the timeout you pass in is only used for the cancel function
     */
    const exe = <_T extends Data | undefined = undefined, _E = undefined>(_payload?: RawRequest) => {
        // type RType = _T extends undefined ? T : _T;
        type RType = _T extends undefined ? (T extends undefined ? Data : T) : _T;
        type RErr = _E extends undefined ? (E extends undefined ? Error : E) : _E;

        const { base_url, path, params, key, method, options, timeout, ...rest } = payload ?? {};

        const {
            base_url: _base_url,
            path: _path,
            params: _params,
            key: _key,
            method: _method,
            options: _options,
            timeout: _timeout,
            ..._rest
        } = _payload ?? {};

        const __payload = {
            key: _key ?? key,
            path: _path ?? path,
            timeout: _timeout ?? timeout,
            base_url: _base_url ?? base_url,
            params: _params ?? params,
            method: _method ?? method,
            ..._rest,
            ...rest,
            options: {
                ...options,
                ..._options,
                signal: controller.signal,
            },
        };

        schedule(__payload.timeout, 'Request timeout exceeded');

        return request<RType, RErr>(__payload);
    };

    const cancel = () => {
        clear();
        kill();
    };

    return { exe, cancel };
};

/* ******************************************************************************************************************** */

export const resolve = async <T extends Data>(_key: RequestKey, del = true) => {
    const payload = get_request(_key);

    if (!payload) return;

    const response = await request<T>(payload);

    if (response.success && del) delete_request(_key);

    return response;
};

/* ******************************************************************************************************************** */

type ProxiedPayload<M extends HttpMethod> = Omit<
    IRawRequest<M> & (M extends IMethods['GET'] ? unknown : { data?: TData }),
    'method'
>;

type ProxiedRequest = {
    [M in HttpMethod]: <T extends Data, E = any>(payload?: ProxiedPayload<M>) => ReturnType<typeof request<T, E>>;
};

const http_request = <T extends Data, E>(payload: RawRequest, method: HttpMethod) => {
    return request<T, E>({ ...payload, options: { ...payload?.options, method } });
};

export const http = new Proxy({} as ProxiedRequest, {
    get(_, method: HttpMethod) {
        // return (payload: any) => {
        //     return request({ ...payload, options: { ...payload?.options, method } });
        // };

        return (payload: any) => http_request(payload, method);
    },
});

/* ******************************************************************************************************************** */

// Here is the thing y'all

type EntityKey = keyof typeof RequestsMap | Plurify<keyof typeof RequestsMap>;

// Fix --> string
const entity_to_end_point = (entity: EntityKey) => {
    let end_point = Reflect.get(RequestsMap, entity); // put the url in the Map in case of complicated ones

    if (!end_point) end_point = plurify(entity); // otherwise we will just plurify what you provided (entity) & use it as end_point

    return end_point as string;
};

type MethodSpecificProxiedPayload<M extends HttpMethod> = Omit<
    IRawRequest<M> & (M extends IMethods['GET'] ? unknown : { data?: TData }),
    'method' | 'path'
>;

type MethodSpecificProxiedRequest = {
    [M in HttpMethod]: <T extends Data, E = any>(
        payload?: MethodSpecificProxiedPayload<M>
    ) => ReturnType<typeof request<T, E>>;
};

// /* ******************************************************************************************************************** */

// ***************** GET

type ProxiedGETRequest = {
    [Key in EntityKey]: MethodSpecificProxiedRequest[IMethods['GET']];
} & ProxiedRequest[IMethods['GET']];

// ***************** POST

type ProxiedPOSTRequest = {
    [Key in EntityKey]: MethodSpecificProxiedRequest[Exclude<HttpMethod, IMethods['GET']>];
} & ProxiedRequest[Exclude<HttpMethod, IMethods['GET']>];

// Fix try using this http_request
const createProxiedMethod = <T extends object>(method: HttpMethod) => {
    return new Proxy({} as T, {
        get(_, entity: EntityKey) {
            return async (payload: any) => {
                const path = entity_to_end_point(entity);

                return http[method]({ ...payload, path });
            };
        },

        apply(payload: any) {
            return http[method](payload);
        },
    });
};

export const get = createProxiedMethod<ProxiedGETRequest>('GET');

export const post = createProxiedMethod<ProxiedPOSTRequest>('POST');

export const put = createProxiedMethod<ProxiedPOSTRequest>('PUT');

export const drop = createProxiedMethod<ProxiedPOSTRequest>('DELETE');

// addEventListener('fetch', (event) => {
//     console.log(event); // use it to ex: set a token ...
// });
