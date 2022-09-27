import React, { type FC, type MutableRefObject, forwardRef, useRef } from 'react';
import styles from '~/assets/scss/modules/modal.module.scss';
import Button from '@/UI/Button';
import useClickOutside from '~/hooks/useClickOutside';
import { NOOP } from '~/utils';

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const defaultTxt = {
    cancelTxt: 'cancel',
    ProceedTxt: 'proceed',
    bodyTxt: 'Are you sure, do you want to delete ? ...',
    HeadTxt: 'Confirm',
};

export const Overlay = forwardRef<HTMLDivElement, { className?: string } & DivProps>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={`${styles.overlay} ${className}`} {...props}>
            {children}
        </div>
    )
);

interface ContainerProps extends DivProps {
    head: React.ReactNode;
    body: React.ReactNode;
    actions: React.ReactNode;
}

export const Container = forwardRef<HTMLDivElement, { className?: string } & ContainerProps>(
    ({ head, body, actions, className, ...props }, ref) => {
        return (
            <div ref={ref} className={`${styles.container} ${className}`} {...props}>
                {head}
                {body}
                {actions}
            </div>
        );
    }
);

type ConfirmProps = { onProceed?: TFunction; onClose?: TFunction } & Partial<typeof defaultTxt> &
    ({ dismissible: false; onDismiss?: never } | { dismissible: true; onDismiss: TFunction });

const Modal: FC<ConfirmProps> = ({ onDismiss = NOOP, onProceed = NOOP, onClose = NOOP, ...defaultTxt }) => {
    const containerRef = useRef() as MutableRefObject<HTMLDivElement>;

    useClickOutside(containerRef, () => {
        onDismiss();
    });

    const head = <p className={styles.head}>{defaultTxt.HeadTxt}</p>;
    const body = <p className={styles.body}>{defaultTxt.bodyTxt}</p>;
    const actions = (
        <div className={styles.actions}>
            <Button onClick={onClose} medium>
                {defaultTxt.cancelTxt}
            </Button>
            <Button onClick={onProceed} medium>
                {defaultTxt.ProceedTxt}
            </Button>
        </div>
    );

    return (
        <Overlay>
            <Container ref={containerRef} className={styles.confirm} head={head} body={body} actions={actions} />;
        </Overlay>
    );
};

export default Modal;
