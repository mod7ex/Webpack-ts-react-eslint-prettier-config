import { type FC, type MutableRefObject, useRef } from 'react';
import { type ModalContent, Container, Overlay } from '@/modals';
import styles from '~/assets/scss/modules/modal.module.scss';
import { createPortal } from 'react-dom';
import Button from '@/UI/Button';

interface FormProps {
    onDismiss?: TFunction;
    onSubmit?: TFunction;
    onClose?: TFunction;
    content: Partial<ModalContent>;
    children?: React.ReactNode;
    open: boolean;
    loading?: boolean;
}

const container = document.getElementById('modals')!;

export const Raw: FC<FormProps> = ({ children, onDismiss, onSubmit, onClose, content, open, loading = false }) => {
    const containerRef = useRef() as MutableRefObject<HTMLDivElement>;

    if (!open) return null;

    const head = <p className={styles.head}>{content.Head}</p>;
    const body = <div className={styles.body}>{children ?? content.body}</div>;
    const actions = (
        <div className={styles.actions}>
            <Button onClick={onClose} medium>
                {content.cancel}
            </Button>
            <Button onClick={onSubmit} medium disabled={loading}>
                {loading ? '...' : content.Proceed}
            </Button>
        </div>
    );

    return createPortal(
        <Overlay onDismiss={onDismiss}>
            <Container ref={containerRef} className={styles.form} head={head} body={body} actions={actions} />
        </Overlay>,
        container
    );
};

export default Raw;
