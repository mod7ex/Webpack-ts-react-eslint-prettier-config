import { createAbortion, is_empty, sleep, uuidGen, type UUID } from '~/utils';
import logger from './logger';

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

// addEventListener('fetch', (event) => {}); // use it to set a token ...

/**
 *
 * we use fetch here we can use some other api like axios <package>
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 *
 */

interface IRequest {
    base_url?: string;
    path?: string;
    options?: RequestInit;
    timeout?: number;
}

type Result<T> = Promise<
    { success: false; error: any; message: string } | { success: true; message: string; data: T; response: Response }
>;

const request = async <T>({
    path = '',
    options = { method: 'GET' },
    timeout = DEFAULT_TIMEOUT,
    base_url = BASE_URL,
}: IRequest): Result<T> => {
    const end_point = `${base_url}/${path}`;

    const { controller, clear } = createAbortion(timeout);

    let data: T | TEmpty;
    let response: Response | TEmpty;
    let error: TypeError | TEmpty;

    try {
        response = await fetch(end_point, {
            signal: controller.signal,
            headers: headers(options?.body?.toString().length ?? 0),
            ...options,
        });

        if (!response.ok) {
            throw new TypeError('Network response was not OK');
        }

        data = (await response.json()) as T;

        logger.log(response);
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
    private queue: (IRequest & { key: UUID<Numberish> })[] | undefined;

    constructor(
        private _name: string = 'random',
        private base_url: string = BASE_URL,
        private timeout: number = 3000
    ) {}

    request<T>(payload: Omit<IRequest, 'base_url'>) {
        return request<T>({ base_url: this.base_url, ...payload });
    }

    store(payload: Omit<IRequest, 'base_url'>, key = uuid()) {
        (this.queue ?? (this.queue = [])).push({ base_url: this.base_url, ...payload, key });
    }

    resolve(_key: UUID<Numberish>) {
        if (is_empty(this.queue)) return;

        const payload = this.queue.find(({ key }) => key === _key);

        if (!payload) return;

        const response = this.request(payload);

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
}

export default new ApiRequest();
