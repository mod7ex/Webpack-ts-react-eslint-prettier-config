import useAsync from './hooks/useAsync';
import { get } from '~/helpers/requests';
import { useState } from 'react';
import { formattedJSON } from './utils';

interface User {
    id: number;
    name: string;
    email: string;
    gender: string;
    status: string;
}

const App = () => {
    const [count, setCount] = useState(0);

    const { loading, error, value } = useAsync(() => {
        return get.users<User>({ timeout: 30000, params: { name: 'mod' } });
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
