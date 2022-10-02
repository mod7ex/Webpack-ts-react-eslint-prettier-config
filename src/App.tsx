import Confirm from '@/modals/Confirm';
import { TXT } from '@/modals';
import { useAppDispatch } from '~/store/hooks';
import { up } from '~/store/slices/modal';

const App = () => {
    const dispatch = useAppDispatch();

    return (
        <>
            <Confirm txt={TXT} dismissible={true} />
            <button onClick={() => dispatch(up())}>show modal</button>
        </>
    );
};

export default App;
