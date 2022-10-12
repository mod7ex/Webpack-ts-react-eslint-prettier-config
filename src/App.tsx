import FormModal from '@/modals/Form';
import { useState } from 'react';
import { sleep } from './utils';

const App = () => {
    const [up, setUp] = useState(false);
    const [loading, setLoading] = useState(false);

    // const body = (
    //    <form>
    //        <div className="form-section">
    //            <label htmlFor="first_name">First name</label>
    //            <input id="first_name" type="text" />
    //        </div>
    //        <div className="form-section">
    //            <label htmlFor="last_name">Last name</label>
    //            <input id="last_name" type="text" />
    //        </div>
    //        <div className="form-section">
    //            <label htmlFor="email">E-mail</label>
    //            <input id="email" type="email" />
    //        </div>
    //    </form>
    // );

    const props: React.ComponentProps<typeof FormModal> = {
        onClose: () => {
            setUp(false);
        },

        onSubmit: () => {
            console.count('helo');
            setLoading(true);
            sleep(3000).finally(() => {
                setLoading(false);
                setUp(false);
            });
        },

        content: {
            Proceed: 'Submit',
            cancel: 'cancel',
            Head: 'Create an item',
        },

        open: up,

        loading,
    };

    return (
        <>
            <FormModal {...props}>
                <form>
                    <div className="form-section">
                        <label htmlFor="first_name">First name</label>
                        <input id="first_name" type="text" />
                    </div>

                    <div className="form-section">
                        <label htmlFor="last_name">Last name</label>
                        <input id="last_name" type="text" />
                    </div>

                    <div className="form-section">
                        <label htmlFor="email">E-mail</label>
                        <input id="email" type="email" />
                    </div>
                </form>
            </FormModal>

            <button onClick={() => setUp((v) => !v)}>show modal</button>
        </>
    );
};

export default App;
