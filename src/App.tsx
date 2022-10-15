import useAsync from './hooks/useAsync';
import api from '~/helpers/requests';
import { useState } from 'react';

const App = () => {
    const [count, setCount] = useState(0);

    const { loading, error, value } = useAsync(() => {
        return api.request({
            path: 'posts',
            timeout: 30000,
            options: {
                method: 'POST',
                body: JSON.stringify({
                    email: 'mod@mod.ma',
                    password: 'password',
                }),
            },
        });
    }, [count]);

    const ping = () => {
        setCount((v) => v + 1);
    };

    return (
        <>
            <button onClick={ping}>click</button>

            <br />

            <br />

            {loading ? (
                'loading ...'
            ) : (
                <>
                    <pre>{JSON.stringify(value)}</pre>
                    <br />
                    <br />
                    <pre>{JSON.stringify(error)}</pre>
                </>
            )}
        </>
    );
};

export default App;
