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
// import RequestsMap from '~/helpers/requests/requests-map.json';

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

export const prepare_request = (payload: RawRequest) => {
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

type Result<T extends Data, P extends keyof T, E = any> =
    | { success: false; error: E; message: string; key?: RequestKey }
    | {
          success: true;
          message: 'Success !';
          data: keyof T extends P ? T : Pick<T, P>;
          response: Response;
          key?: RequestKey;
      };

export const request = async <T extends Data, P extends keyof T = keyof T, E = any>(
    payload?: RawRequest,
    pick_keys?: P[]
): Promise<Result<T, P, E>> => {
    if (!payload) payload = {};

    const { method, base_url, path, timeout, params, key, options } = payload;

    const end_point = path_join(base_url ?? DEFAULTS.BASE_URL, path ?? '');

    const query = params ? payload_to_query(params) : '';

    const { controller, clear } = createAbortion({
        timeout: timeout ?? DEFAULTS.TIMEOUT,
        reason: 'Request timeout exceeded',
    });

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

        const data = <T>await response.json();

        // logger.log(response);
        logger.log(data);

        return {
            // @ts-ignore
            data: pick_keys ? pick<T, P>(data, pick_keys) : data,
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

// export const createRequest = <
//     T extends object | undefined = undefined,
//     P extends Keys<T> | undefined = Keys<T>,
//     E = any
// >(
//     payload?: RawRequest,
//     pick_keys?: P
// ) => {
//     const { controller, clear, schedule, kill } = createAbortion({
//         timeout: DEFAULTS.TIMEOUT as number,
//     });

//     const exe = <_T extends object, _P extends Keys<T> = Keys<T>, _E = any>(_payload?: RawRequest, _pick_keys?: _P) => {
//         type RType = T extends undefined ? _T : T;
//         type RPick = Keys<RType>;
//         type RErr = E extends undefined ? _E : E;

//         const { base_url, path, params, key, method, options, timeout, ...rest } = payload ?? {};

//         const {
//             base_url: _base_url,
//             path: _path,
//             params: _params,
//             key: _key,
//             method: _method,
//             options: _options,
//             timeout: _timeout,
//             ..._rest
//         } = _payload ?? {};

//         const __payload = {
//             key: _key ?? key,
//             path: _path ?? path,
//             timeout: _timeout ?? timeout,
//             base_url: _base_url ?? base_url,
//             params: _params ?? params,
//             method: _method ?? method,
//             ..._rest,
//             ...rest,
//             options: {
//                 ...options,
//                 ..._options,
//                 signal: controller.signal,
//             },
//         };

//         schedule(__payload.timeout, 'Request timeout exceeded');

//         return request<RType, RPick, RErr>(__payload);
//     };

//     const cancel = () => {
//         clear();
//         kill();
//     };

//     return { exe, cancel };
// };

// // *******************************

interface User {
    id?: number;
    name?: string;
    email?: string;
    gender?: string;
    status?: string;
}

export const foo = <T extends object>(payload: User) => {
    return <P extends keyof T>(pick_keys: P[]) => {
        const result = pick(payload, ['email', 'gender']) as T;

        return pick(result, pick_keys);
    };
};

const {} = foo<User>({ name: 'hh', id: 33 })(['name', 'id']);

// // **************************************************************************************************** Test

// export type IsNotAny<T> = 0 extends 1 & T ? false : true;

// export type IsTypeEqual<T1, T2> = IsNotAny<T1> extends false
//     ? false
//     : IsNotAny<T2> extends false
//     ? false
//     : [T1] extends [T2]
//     ? [T2] extends [T1]
//         ? true
//         : false
//     : false;

// // ****************************************************************************************************

// type Res = IsTypeEqual<UnionToArr<'a' | 'b'>, ['a', 'b']>;
