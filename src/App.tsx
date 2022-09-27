import Modal from '@/Modal';
import { useState } from 'react';

const App = () => {
    const [up, setUp] = useState(true);

    return (
        <>
            {/* <Modal dismissible={true} onDismiss={onDismiss} onProceed={onProceed} onClose={onClose} /> */}
            {up && (
                <Modal
                    dismissible={true}
                    onDismiss={() => setUp(false)}
                    onProceed={() => setUp(false)}
                    onClose={() => setUp(false)}
                />
            )}

            <button onClick={() => setUp(true)}>show modal</button>
        </>
    );
};

export default App;
