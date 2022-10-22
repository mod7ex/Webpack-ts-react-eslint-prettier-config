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
