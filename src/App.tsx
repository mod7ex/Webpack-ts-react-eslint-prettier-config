import { useState } from "react";

const App = () => {
    const [count, setCount] = useState(0);

    const foo = "some thing";
    // const foo: number = "some thing";

    return (
        <>
            <h1>{count}</h1>
            <hr />
            <button onClick={() => setCount((v) => v + 1)}>increment</button>
            <hr />
            <h1>Hello world</h1>
        </>
    );
};

export default App;
