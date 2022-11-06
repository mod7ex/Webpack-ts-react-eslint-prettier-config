import useAsync from './hooks/useAsync';
import { http } from '~/requests';
import { useState } from 'react';
import { formattedJSON, uuidGen } from './utils';

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

const uuid = uuidGen();

const App = () => {
    const [count, setCount] = useState(0);

    const { loading, error, value } = useAsync(async () => {
        const result = await http.GET<{ products: Product[] }>();

        if (result.success) {
            return result.pick(['products']).products.map(({ brand, description }) => ({ brand, description }));
        }

        return result;
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
