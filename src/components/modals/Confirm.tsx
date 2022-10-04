import { type FC, type MutableRefObject, useRef } from 'react';
import styles from '~/assets/scss/modules/modal.module.scss';
import Button from '@/UI/Button';
import { type ModalContent, Container, Overlay } from '@/modals';
import { createPortal } from 'react-dom';

/* Good example to remember */
/*
    type ConfirmProps = { onProceed?: TFunction; onClose?: TFunction; content: Partial<ModalContent> } & (
        | { dismissible?: false; onDismiss?: never }
        | { dismissible?: true; onDismiss?: TFunction }
    );
*/

interface ConfirmProps {
    onProceed?: TFunction;
    onClose?: TFunction;
    content: Partial<ModalContent>;
    onDismiss?: TFunction;
}

export const Raw: FC<ConfirmProps> = ({ onDismiss, onProceed, onClose, content }) => {
    const containerRef = useRef() as MutableRefObject<HTMLDivElement>;

    const head = <p className={styles.head}>{content.Head}</p>;
    const body = <p className={styles.body}>{content.body}</p>;
    const actions = (
        <div className={styles.actions}>
            <Button onClick={onClose} medium>
                {content.cancel}
            </Button>
            <Button onClick={onProceed} medium>
                {content.Proceed}
            </Button>
        </div>
    );

    return (
        <Overlay onDismiss={onDismiss}>
            <Container ref={containerRef} className={styles.confirm} head={head} body={body} actions={actions} />
        </Overlay>
    );
};

const container = document.getElementById('modals')!;

const Modal: FC<{ open: boolean } & ConfirmProps> = ({ open, ...props }) => {
    if (!open) return null;

    return createPortal(<Raw {...props} />, container);
};

export default Modal;
