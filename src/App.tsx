import { useState } from 'react';
import NestedLinks from '@/NestedLinks';
import AppImg from '@/app-img';

const App = () => {
    const [count, setCount] = useState(0);

    return (
        <>
            <h1>{count}</h1>
            <hr />
            <NestedLinks />
            <hr />
            <AppImg
                src={require('~/assets/img/photo.jpg')}
                width="300"
                height="300"
            />
            <hr />
            <AppImg
                src="https://media.sistockphoto.com/photos/mountain-landscape-picture-id517188688"
                width="300"
                height="300"
                alt="some beautiful nature image"
            />
            <hr />
            <button onClick={() => setCount((v) => v + 1)}>increment</button>
            <hr />
            <h1>Hello world</h1>
        </>
    );
};

export default App;
