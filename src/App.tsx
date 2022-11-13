import useAsync from './hooks/useAsync';
import { useState } from 'react';
import { formattedJSON } from './utils';
import { GET_USERS, query } from '~/requests/query';

interface User {
    id: number;
    name: string;
    email: string;
    gender: string;
    status: string;
}

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
}

const App = () => {
    const [count, setCount] = useState(0);

    const { loading, error, value } = useAsync(async () => {
        return query(GET_USERS, { params: { user_id: 22 } });
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
