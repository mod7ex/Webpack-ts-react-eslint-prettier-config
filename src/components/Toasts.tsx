import styles from '~/assets/scss/modules/toasts.module.scss';
import { createPortal } from 'react-dom';
import React, { FC } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { remove } from '~/store/slices/toasts';

const container = document.getElementById('toasts')!;

interface Props {
    title?: React.ReactNode;
    content?: React.ReactNode;
    onClose?: TFunction;
}
const Toast: FC<Props> = ({ title, content, onClose }) => {
    return (
        <li className={styles.toast}>
            <p className={styles.title}>{title}</p>
            <div className={styles.content}>{content}</div>
            <i onClick={onClose}>
                <span>&#x2715;</span>
            </i>
        </li>
    );
};

const Toasts = () => {
    const toasts = useAppSelector((s) => s.toasts);
    const dispatch = useAppDispatch();

    return createPortal(
        <ul className={styles.container}>
            {toasts.map(({ id, title, content }) => (
                <Toast onClose={() => dispatch(remove(id))} key={id} title={title} content={content} />
            ))}
        </ul>,
        container
    );
};

export default Toasts;
