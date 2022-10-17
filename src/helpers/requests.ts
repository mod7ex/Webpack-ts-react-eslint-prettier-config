import { createAbortion, is_empty, sleep, uuidGen, type UUID } from '~/utils';
import logger from './logger';
// import RequestsMap from '~/helpers/requests-map.json';

interface IActions {
    GET: 'GET' | 'get';
    POST: 'POST' | 'post';
    PUT: 'PUT' | 'put';
    DELETE: 'DELETE' | 'delete';
}

type HttpAction = IActions[keyof IActions];

type OmittedMethodOptions = Omit<RequestInit, 'method'>;
type OmittedBodyAndMethodOptions = Omit<OmittedMethodOptions, 'body'>;
type GetRequestOptions = OmittedBodyAndMethodOptions & { method: IActions['GET'] };
type PostBasedRequestOptions = OmittedBodyAndMethodOptions & {
    method: Exclude<HttpAction, IActions['GET']>;
    body?: RequestInit['body'];
};

type RequestOptions = GetRequestOptions | PostBasedRequestOptions;

interface IRawRequest {
    base_url?: string;
    path?: string;
    timeout?: number;
}

interface IRequest extends IRawRequest {
    options?: RequestOptions;
}

const UUID_PAYLOAD = 'api-requests';
const uuid = uuidGen(UUID_PAYLOAD);

const BASE_URL = 'https://gorest.co.in/public/v2';
const DEFAULT_TIMEOUT = 3000;

const headers = (options?: object) => {
    return new Headers({
        'Content-Type': 'application/json',
        // 'Content-Length': options?.body?.toString().length,
    });
};

const DEFAULT_OPTIONS: RequestOptions = {
    method: 'GET',
};

/**
 *
 * we use fetch here we can use some other api like axios <package>
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 *
 */
type Result<T> = Promise<
    | { success: false; error: any; message: string; key?: RequestKey }
    | { success: true; message: 'Success !'; data: T; response: Response; key?: RequestKey }
>;
export const request = async <T>({
    path = '',
    options,
    timeout = DEFAULT_TIMEOUT,
    base_url = BASE_URL,
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

type ProxiedRequest = {
    [Key in HttpAction]: <T>(
        payload: IRawRequest & {
            options?: Key extends IActions['GET'] ? OmittedBodyAndMethodOptions : OmittedMethodOptions;
        }
    ) => Result<T>;
};

type RequestKey = { key: UUID<Numberish>; timestamp: number }; // think about making the key a Symbol

export class ApiRequest {
    private weak_map: WeakMap<RequestKey, IRequest> | undefined; // Key Order

    constructor(
        private _name: string = 'random',
        private base_url: string = BASE_URL,
        private timeout: number = DEFAULT_TIMEOUT
    ) {}

    prepare_payload(payload: IRequest) {
        return { base_url: this.base_url, timeout: this.timeout, ...payload };
    }

    store(payload: IRequest, key: RequestKey['key']) {
        const _key = { key, timestamp: Date.now() };

        (this.weak_map ?? (this.weak_map = new Map())).set(_key, this.prepare_payload(payload));

        return _key;
    }

    get_payload(key: RequestKey) {
        return this.weak_map?.get(key);
    }

    delete_payload(key: RequestKey) {
        return this.weak_map?.delete(key) ?? false;
    }

    async request<T>(payload: IRequest, key?: RequestKey['key']) {
        const response = await request<T>(this.prepare_payload(payload));

        if (key) response.key = this.store(payload, key); // if key is provided the payload will be stored

        return response;
    }

    async resolve<T>(_key: RequestKey) {
        const payload = this.get_payload(_key);

        if (!payload) return;

        const response = await this.request<T>(payload);

        if (response.success) this.delete_payload(_key);

        return response;
    }

    // flush({ clear = true }) {}

    get http() {
        return new Proxy<ProxiedRequest>({} as ProxiedRequest, {
            get(_, method: HttpAction) {
                return <T>(payload: IRequest) => {
                    const { base_url, options, path, timeout } = payload;
                    return request<T>({ timeout, path, base_url, options: { method, ...options } });
                };
            },
        });
    }

    // get get() {
    //     return new Proxy<ProxiedRequest>({} as ProxiedRequest, {
    //         get(_, key: HttpAction) {
    //             return <T>(payload: IRequest) => {
    //                 const { base_url, options, path, timeout } = payload;
    //                 return request<T>({ timeout, path, base_url, options: { method: key, ...options } });
    //             };
    //         },
    //     });
    // }
}

addEventListener('fetch', (event) => {
    // use it to set a token ...
    console.log(event);
});

export default new ApiRequest();
