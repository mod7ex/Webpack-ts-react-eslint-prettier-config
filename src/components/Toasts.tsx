import styles from '~/assets/scss/modules/toasts.module.scss';
import { createPortal } from 'react-dom';

const container = document.getElementById('toasts')!;

const Toast = () => {
    return <li className={styles.toast}>Lorem ipsum dolor sit amet consectetur.</li>;
};

const Toasts = () => {
    return createPortal(
        <ul className={styles.container}>
            <Toast />
            <Toast />
            <Toast />
            <Toast />
            <Toast />
        </ul>,
        container
    );
};

export default Toasts;
