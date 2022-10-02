import React, { type FC, type MutableRefObject, useRef } from 'react';
import styles from '~/assets/scss/modules/modal.module.scss';
import Button from '@/UI/Button';
import { isFunction } from '~/utils';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { down } from '~/store/slices/modal';
import useEventListener from '~/hooks/useEventListener';
import { type ModalTXT, Container, Overlay } from '@/modals';

type ConfirmProps = { onProceed?: TFunction; onClose?: TFunction; txt: Partial<ModalTXT> } & (
    | { dismissible?: false; onDismiss?: never }
    | { dismissible?: true; onDismiss?: TFunction }
);

const Raw: FC<ConfirmProps> = ({ dismissible = false, onDismiss, onProceed, onClose, txt }) => {
    const dispatch = useAppDispatch();

    const containerRef = useRef() as MutableRefObject<HTMLDivElement>;
    const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

    const proceedHandler = () => {
        if (isFunction(onProceed)) onProceed();

        dispatch(down());
    };

    const closeHandler = () => {
        if (isFunction(onClose)) onClose();

        dispatch(down());
    };

    useEventListener(
        'click',
        (e) => {
            if (!dismissible) return;

            if (e.target === overlayRef.current) {
                if (isFunction(onDismiss)) onDismiss();

                dispatch(down());
            }
        },
        overlayRef
    );

    const head = <p className={styles.head}>{txt.Head}</p>;
    const body = <p className={styles.body}>{txt.body}</p>;
    const actions = (
        <div className={styles.actions}>
            <Button onClick={closeHandler} medium>
                {txt.cancel}
            </Button>
            <Button onClick={proceedHandler} medium>
                {txt.Proceed}
            </Button>
        </div>
    );

    return (
        <Overlay ref={overlayRef}>
            <Container ref={containerRef} className={styles.confirm} head={head} body={body} actions={actions} />
        </Overlay>
    );
};

const Confirm: FC<ConfirmProps> = (props) => {
    const isModalUp = useAppSelector((s) => s.modal.up);

    return <>{isModalUp && <Raw {...props} />}</>;
};

export default Confirm;
