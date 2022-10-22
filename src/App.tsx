import useAsync from './hooks/useAsync';
import { get, post } from '~/helpers/requests';
import { useState } from 'react';
import { formattedJSON } from './utils';

interface User {
    id: number;
    name: string;
    email: string;
    gender: string;
    status: string;
}

interface Admin {
    id: number;
    gender: string;
    status: string;
}

const App = () => {
    const [count, setCount] = useState(0);

    const { loading, error, value } = useAsync(async () => {
        // const result = await get.user<User>({});
        const result = await post.cars;

        if (result.success) {
            const {} = result.pick();

            return result.data;
        }
    }, [count]);

    const ping = () => {
        setCount((v) => v + 1);
    };

    // if (value?.success) {
    //     const {} = value;
    // }

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
