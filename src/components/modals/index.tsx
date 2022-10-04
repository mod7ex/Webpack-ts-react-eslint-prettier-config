import React, { forwardRef, MutableRefObject, useRef, type FC } from 'react';
import styles from '~/assets/scss/modules/modal.module.scss';
import { isFunction } from '~/utils';
import useEventListener from '~/hooks/useEventListener';

export const TXT = {
    cancel: 'cancel',
    Proceed: 'proceed',
    body: 'Are you sure, do you want to delete ? ...',
    Head: 'Confirm',
};

export type ModalContent<Init = typeof TXT> = Init extends object
    ? { [K in keyof Init]: Init[K] | React.ReactNode } | Init
    : never;

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/*
 * Overlay
 */
type OverlayProps = { className?: string; onDismiss?: TFunction } & DivProps;

export const Overlay: FC<OverlayProps> = ({ children, className, onDismiss, ...props }) => {
    const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

    useEventListener(
        'click',
        (e) => {
            if (e.target === overlayRef.current && isFunction(onDismiss)) onDismiss();
        },
        overlayRef
    );

    return (
        <div ref={overlayRef} className={`${styles.overlay} ${className ?? ''}`} {...props}>
            {children}
        </div>
    );
};

/*
 * Container
 */

interface ContainerProps extends DivProps {
    head?: string | React.ReactNode;
    body?: string | React.ReactNode;
    actions?: React.ReactNode;
}

export const Container = forwardRef<HTMLDivElement, { className?: string } & ContainerProps>(
    ({ className, head, body, actions, ...props }, ref) => {
        return (
            <div ref={ref} className={`${styles.container} ${className ?? ''}`} {...props}>
                {head}
                {body}
                {actions}
            </div>
        );
    }
);
