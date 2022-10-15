import { useEffect, useState, useCallback } from 'react';
import logger from '~/helpers/logger';

export default function useAsync<T, Er = any>(cb: () => Promise<T>, dependecies: any[] = []) {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState<T | TEmpty>(undefined);
    const [error, setError] = useState<Er | TEmpty>(undefined);

    const cbMemo = useCallback(() => {
        setLoading(true);

        setError(undefined);
        setValue(undefined);

        cb()
            .then((v) => {
                setValue(v);
                setError(undefined);
            })
            .catch((v: Er) => {
                logger.error(v);
                setValue(undefined);
                setError(v);
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependecies);

    useEffect(cbMemo, [cbMemo]);

    return { loading, value, error } as const;
}
