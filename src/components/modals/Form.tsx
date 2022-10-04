import { type FC, type MutableRefObject, useRef } from 'react';
import { type ModalContent, Container, Overlay } from '@/modals';
import styles from '~/assets/scss/modules/modal.module.scss';
import { createPortal } from 'react-dom';
import Button from '@/UI/Button';

interface FormProps {
    onSubmit?: TFunction;
    onClose?: TFunction;
    content: Partial<ModalContent>;
    onDismiss?: TFunction;
    open: boolean;
    children?: React.ReactNode;
}

const container = document.getElementById('modals')!;

export const Raw: FC<FormProps> = ({ children, onDismiss, onSubmit, onClose, content, open }) => {
    const containerRef = useRef() as MutableRefObject<HTMLDivElement>;

    if (!open) return null;

    const head = <p className={styles.head}>{content.Head}</p>;
    const actions = (
        <div className={styles.actions}>
            <Button onClick={onClose} medium>
                {content.cancel}
            </Button>
            <Button onClick={onSubmit} medium>
                {content.Proceed}
            </Button>
        </div>
    );

    return createPortal(
        <Overlay onDismiss={onDismiss}>
            <Container ref={containerRef} className={styles.confirm} head={head} body={children} actions={actions} />
        </Overlay>,
        container
    );
};

export default Raw;
