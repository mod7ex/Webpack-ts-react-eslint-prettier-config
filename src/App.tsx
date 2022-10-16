import useAsync from './hooks/useAsync';
import api from '~/helpers/requests';
import { useState } from 'react';
import { formattedJSON } from './utils';

const App = () => {
    const [count, setCount] = useState(0);

    const { loading, error, value } = useAsync(() => {
        return api.http.get({
            timeout: 30000,
            path: 'users',
            options: {},
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
