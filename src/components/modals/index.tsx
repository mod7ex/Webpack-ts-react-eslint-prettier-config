import React, { forwardRef } from 'react';
import styles from '~/assets/scss/modules/modal.module.scss';

export const TXT = {
    cancel: 'cancel',
    Proceed: 'proceed',
    body: 'Are you sure, do you want to delete ? ...',
    Head: 'Confirm',
};

export type ModalTXT = typeof TXT;

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/*
 * Overlay
 */
export const Overlay = forwardRef<HTMLDivElement, { className?: string } & DivProps>(
    ({ children, className, ...props }, ref) => (
        <div ref={ref} className={`${styles.overlay} ${className ?? ''}`} {...props}>
            {children}
        </div>
    )
);

interface ContainerProps extends DivProps {
    head?: React.ReactNode;
    body?: React.ReactNode;
    actions?: React.ReactNode;
}

/*
 * Container
 */
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
