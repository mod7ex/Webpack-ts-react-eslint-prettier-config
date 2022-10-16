import { createAbortion, is_empty, sleep, uuidGen, type UUID } from '~/utils';
import logger from './logger';

interface IActions {
    GET: 'GET' | 'get';
    POST: 'POST' | 'post';
    PUT: 'PUT' | 'put';
    DELETE: 'DELETE' | 'delete';
}

type HttpAction = IActions[keyof IActions];

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

const OPTIONS: RequestOptions = {
    method: 'GET',
};

// addEventListener('fetch', (event) => {}); // use it to set a token ...

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

/**
 *
 * we use fetch here we can use some other api like axios <package>
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 *
 */
type Result<T> = Promise<
    { success: false; error: any; message: string } | { success: true; message: string; data: T; response: Response }
>;
const request = async <T>({
    path = '',
    options,
    timeout = DEFAULT_TIMEOUT,
    base_url = BASE_URL,
}: IRequest): Result<T> => {
    const end_point = `${base_url}/${path}`;

    const { controller, clear } = createAbortion(timeout);

    let data: T | TEmpty;
    let response: Response | TEmpty;
    let error: TypeError | TEmpty;

    const _options = {
        signal: controller.signal,
        headers: headers(options),
        ...OPTIONS,
        ...options,
    };

    try {
        response = await fetch(end_point, _options);

        if (!response.ok) throw new TypeError('Network response was not OK');

        data = (await response.json()) as T;

        // logger.log(response);
        logger.log(data);

        return { data, message: 'Success !', success: true, response };
    } catch (err: any) {
        logger.error(error);

        return { error: err, message: error?.message ?? 'Something went wrong', success: false };
    } finally {
        clear();
    }
};

interface ProxiedRequest {
    ['GET']<T>(payload: IRawRequest & { options: OmittedBodyAndMethodOptions }): Result<T>;
    ['get']<T>(payload: IRawRequest & { options: OmittedBodyAndMethodOptions }): Result<T>;

    ['POST']<T>(payload: IRawRequest & { options: OmittedMethodOptions }): Result<T>;
    ['post']<T>(payload: IRawRequest & { options: OmittedMethodOptions }): Result<T>;
}

class ApiRequest {
    private queue: (IRequest & { key: UUID<Numberish> })[] | undefined;

    constructor(
        private _name: string = 'random',
        private base_url: string = BASE_URL,
        private timeout: number = 3000
    ) {}

    request<T>(payload: IRequest) {
        return request<T>({ base_url: this.base_url, timeout: this.timeout, ...payload });
    }

    store(payload: IRequest, key = uuid()) {
        (this.queue ?? (this.queue = [])).push({ base_url: this.base_url, timeout: this.timeout, ...payload, key });
    }

    async resolve(_key: UUID<Numberish>) {
        if (is_empty(this.queue)) return;

        const payload = this.queue.find(({ key }) => key === _key);

        if (!payload) return;

        const response = await this.request(payload);

        this.queue.removeBy(_key, 'key');

        return response;
    }

    async flush(step?: number) {
        if (is_empty(this.queue)) return;

        let payload;

        while (this.queue.length) {
            payload = this.queue.pop();
            await this.request(payload!);
            if (!is_empty(this.queue) && step) await sleep(step);
        }
    }

    get http() {
        return new Proxy<ProxiedRequest>({} as ProxiedRequest, {
            get(_, key: HttpAction) {
                return <T>(payload: IRequest) => {
                    const { base_url, options, path, timeout } = payload;

                    return request<T>({ timeout, path, base_url, options: { method: key, ...options } });
                };
            },
        });
    }
}

export default new ApiRequest();
