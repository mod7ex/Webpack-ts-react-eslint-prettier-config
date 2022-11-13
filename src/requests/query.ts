import { trim_slash, payload_to_query } from '~/requests/utils';

const DEFAULTS = {
    BASE_URL: 'https://dummyjson.com',
    TIMEOUT: 3000,
    PATH: '',
    METHOD: 'GET',
    CACHE: true,
    REMEMBER: false,
    CACHE_TTL: 1000 * 60 * 60, // 1h,
};

export const createQuery = (payload?: { path?: RequestInfo | URL; options?: Omit<RequestInit, 'method' | 'body'> }) => {
    const path = payload?.path ?? '/';
    const options = { method: 'GET', ...payload?.options };

    return [path, options] as const;
};

type ExtractParams<P> = P extends '' ? never : P extends `${infer A}/:${infer C}` ? C | ExtractParams<A> : never;

type ZOO = ExtractParams<'some/:username/:posi_id'>;

type DataPayload<K> = K extends string ? Record<K, string | number | boolean> : never;
interface QueryOptions<P> {
    params?: DataPayload<ExtractParams<P>>;
    query?: DataPayload;
}

export const query = <T extends ReturnType<typeof createQuery>>(QUERY: T, data_payload?: QueryOptions<T[0]>) => {
    const [path, options] = QUERY;

    let end_point = path;

    if (typeof path === 'string') {
        const { params, query } = data_payload ?? {};

        params && Object.entries(params).forEach(([key, value]) => path.replace(key, value as string));
        end_point = `${DEFAULTS.BASE_URL}/${trim_slash(path)}${query ? payload_to_query(query) : ''}`;
    }

    return fetch(end_point, options);
};

// ******************************************************************

export const GET_USERS = createQuery({ path: 'users' });
