import Toasts from '~/components/Toasts';
import useToaster from '~/hooks/useToaster';

const App = () => {
    const toast = useToaster({
        title: 'The head',
        content: 'lorem ipsum some random.',
    });

    return (
        <>
            <Toasts />
            <button onClick={() => toast({ title: 'zzz' })}>click</button>
        </>
    );
};

export default App;
