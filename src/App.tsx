import useAsync from './hooks/useAsync';
import { request } from '~/helpers/requests';
import { useState } from 'react';
import { formattedJSON } from './utils';
// import useTimeout from './hooks/useTimeout';

interface User {
    id: number;
    name: string;
    email: string;
    gender: string;
    status: string;
}

// const { exe, cancel } = createRequest<User>({ path: 'users', method: 'GET', params: { name: 'os' } }, ['id']);

const App = () => {
    const [count, setCount] = useState(0);

    const { loading, error, value } = useAsync(() => {
        return request<User>({ path: 'users', method: 'GET', params: { name: 'os' } }, ['id', 'name']);
        // return exe({ timeout: 5000 });
    }, [count]);

    // useTimeout(cancel, 300);

    const ping = () => {
        setCount((v) => v + 1);
    };

    if (value?.success) {
        const {} = value.data;
    }

    return (
        <>
            <button onClick={ping}>click</button>

            <br />

            <br />

            {loading ? (
                'loading ...'
            ) : (
                <>
                    <pre>{formattedJSON(value)}</pre>
                    <br />
                    <br />
                    <pre>{formattedJSON(error)}</pre>
                </>
            )}
        </>
    );
};

export default App;
