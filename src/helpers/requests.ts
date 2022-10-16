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

const BASE_URL = 'https://jsonplaceholder.typicode.com';

const DEFAULT_TIMEOUT = 3000;

const headers = (content_length: number) => {
    return new Headers({
        'Content-Type': 'application/json',
        'Content-Length': content_length.toString(),
    });
};

const OPTIONS: RequestInit = {
    method: 'GET',
};

// addEventListener('fetch', (event) => {}); // use it to set a token ...

/**
 *
 * we use fetch here we can use some other api like axios <package>
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 *
 */

// interface IRequestOptions<T extends HttpAction> extends Omit<RequestInit, 'body' | 'method'> {
//     method: T;
//     body: T extends IActions['GET'] ? never : RequestInit['body'];
// }

type RequestOptions =
    | (Omit<RequestInit, 'body' | 'method'> & { method: IActions['GET'] })
    | (Omit<RequestInit, 'body' | 'method'> & {
          method: Exclude<HttpAction, IActions['GET']>;
          body: RequestInit['body'];
      });

interface IRawRequest {
    base_url?: string;
    path?: string;
    timeout?: number;
}

interface IRequest<T extends HttpAction> extends IRawRequest {
    options?: RequestOptions;
}

type Result<T> = Promise<
    { success: false; error: any; message: string } | { success: true; message: string; data: T; response: Response }
>;

const request = async <T, M extends HttpAction>({
    path = '',
    options,
    timeout = DEFAULT_TIMEOUT,
    base_url = BASE_URL,
}: IRequest<M>): Result<T> => {
    const end_point = `${base_url}/${path}`;

    const { controller, clear } = createAbortion(timeout);

    let data: T | TEmpty;
    let response: Response | TEmpty;
    let error: TypeError | TEmpty;

    const _options = {
        signal: controller.signal,
        headers: headers(options?.body?.toString().length ?? 0),
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

class ApiRequest {
    private queue: (IRequest<HttpAction> & { key: UUID<Numberish> })[] | undefined;

    constructor(
        private _name: string = 'random',
        private base_url: string = BASE_URL,
        private timeout: number = 3000
    ) {}

    request<T, M extends HttpAction>(payload: IRequest<M>) {
        const { base_url, timeout } = this;

        return request<T, M>({ base_url, timeout, ...payload });
    }

    store<T extends HttpAction>(payload: IRequest<T>, key = uuid()) {
        const { base_url, timeout } = this;

        (this.queue ?? (this.queue = [])).push({ base_url, timeout, ...payload, key });
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
        return new Proxy(this, {
            get(target, key: HttpAction) {
                if (key === 'get') {
                    return <T>(payload: IRequest<IActions['GET']>) => {
                        const { base_url, options, path, timeout } = payload;

                        return target.request<T, IActions['GET']>({
                            timeout,
                            path,
                            base_url,
                            options: { method: 'GET', ...options },
                        });
                    };
                }
            },
        });
    }
}

export default new ApiRequest();
