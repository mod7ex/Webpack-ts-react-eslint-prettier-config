import FormModal from '@/modals/Form';
import { TXT } from '@/modals';
import { useState } from 'react';

const foo = () => {
    console.log('hello');
};

const App = () => {
    const [up, setUp] = useState(false);

    const props: React.ComponentProps<typeof FormModal> = {
        onClose: () => {
            setUp(false);
        },

        onSubmit: () => {
            foo();
            setUp(false);
        },

        onDismiss: () => {
            setUp(false);
        },

        content: TXT,

        open: up,
    };

    return (
        <>
            <FormModal {...props}>
                <div>
                    <input type="text" />
                </div>
            </FormModal>

            <button onClick={() => setUp((v) => !v)}>show modal</button>
        </>
    );
};

export default App;
